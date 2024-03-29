'use strict';

$(function () {
    var myDropzone = new Dropzone("#upload-dialog", {
        url: "/upload",
        previewTemplate: document.querySelector('#dropzone-template').innerHTML
    });

    class Dialog {
        constructor(element) {
            this.element = element;
            this.visibility = false;
            this.init()
        }

        init() {}

        on_key_up(e) {
            if (this.visibility === true) {
                this.on_key_up_implementation(e)

                if (e.which == 27) {
                    e.preventDefault();
                    this.hide()
                }
            }
        }

        on_key_up_implementation(e) {}
        close_implementation(e) {}

        show() {
            this.visibility = true;
            this.element.css('visibility', 'visible');
            $('#intro').css('visibility', 'hidden');
        }

        hide() {
            this.visibility = false;
            this.element.css('visibility', 'hidden');
            this.close_implementation();
        }
    }

    function perform_query() {
        let q = $("#query").val();
        Results.build_list(q);
    }

    class PromptDialog extends Dialog {
        init(element) {
            $("#query").keyup(perform_query);
        }

        show() {
            super.show();
            $('#query').focus();
            $('#query').select();
            $('#list-viewer').css('visibility', 'visible');
            $('#pdf-viewer').css('visibility', 'hidden');
            $('#pdf-viewer').css('display', 'none');
            perform_query();
            // this.select_entry(0);
        }

        hide() {
            super.hide();
            $('#query').blur();
            $('#query').blur();
            $('#pdf-viewer').css('visibility', 'visible');
            $('#pdf-viewer').css('display', 'block');
            $('#list-viewer').css('visibility', 'hidden');
        }

        on_key_up_implementation(e) {
            if (e.which == 40) {
                // arrow down
                e.preventDefault();
                Results.select_entry(Results.current() + 1);
            }
            if (e.which == 38) {
                // arrow up
                e.preventDefault();
                Results.select_entry(Results.current() - 1);
            }
            if (e.which == 13) {
                // enter/return
                e.preventDefault();
                SheetApp.open(Results.current_params());
                this.hide();
                dialogs.active_idx = -1;
                // renderPDF(a.data('url'), a.data('title'), a.data('artist'))
            }
        }
        close_implementation(e) {}
    }

    class UploadDialog extends Dialog {
        on_key_up_implementation(e) {}
        close_implementation(e) {
            myDropzone.removeAllFiles();
        }
    }

    class Dialogs {
        constructor() {
            this.dialogs = [];
            this.shortcuts = [];
            this.active_idx = -1;
        }

        active_dialog() {
            return this.dialogs[this.active_idx];
        }

        push(dialog, shortcut) {
            this.dialogs.push(dialog);
            this.shortcuts.push(shortcut);
        }

        show(idx) {
            this.active_idx = idx;
            this.active_dialog().show();
        }

        on_key_up(e) {

            for (var i = this.shortcuts.length - 1; i >= 0; i--) {
                if (e.key == this.shortcuts[i]) {
                    this.show(i);
                }
            }
        }
    }

    var SheetApp = {
        pdfUrl: null,
        pdfPages: null,
        pdfDocument: null,
        pdfViewer: null,
        pdfLoadingTask: null,
        current_page_number: 0,
        page_width: null,

        /**
         * Scroll horizontally to a given pagenumber, if within range.
         */
        scroll_to_page: function (page_number) {
            var self = this;
            let container = $("body");
            let target_canvas = $("canvas").eq(page_number);
            const skip = self.page_width + 2;

            let max_page_number = self.pdfDocument.numPages;

            if (self.pdfPages) {
                max_page_number = self.pdfPages.split(',').length;
            }

            if (self.pdfDocument !== null && max_page_number > 0 && target_canvas !== undefined) {
                if ((page_number >= 0) && (page_number < max_page_number)) {
                    self.current_page_number = page_number;
                    container.animate({
                        scrollLeft: container.position().left + page_number * skip
                    }, 1000);
                }
            }
        },

        /**
         * Closes opened PDF document.
         * @returns {Promise} - Returns the promise, which is resolved when all
         *                      destruction is completed.
         */
        close: function () {
            if (!this.pdfLoadingTask) {
                return Promise.resolve();
            }

            var promise = this.pdfLoadingTask.destroy();
            this.pdfLoadingTask = null;
            if (this.pdfDocument) {
                this.pdfDocument = null;
            }
            return promise;
        },

        on_key_up: function (e) {
            if (e.which == 37 || e.which == 49) {
                e.preventDefault();
                this.scroll_to_page(this.current_page_number - 1);
            }

            if (e.which == 39 || e.which == 50) {
                e.preventDefault();
                this.scroll_to_page(this.current_page_number + 1);
            }
        },

        loading_finished: function () {
            $('#spinner').removeClass('spinner');
        },

        progress: function (params) {},
        open: function (params) {
            if (this.pdfLoadingTask) {
                // We need to destroy already opened document
                return this.close().then(function () {
                    // ... and repeat the open() call.
                    return this.open(params);
                }.bind(this));
            }

            var self = this;

            self.pdfUrl = params.url;
            self.pdfPages = params.pages;
            self.pdfDocument = null;

            // Loading document.
            var loadingTask = pdfjsLib.getDocument({
                url: self.pdfUrl,
            });
            this.pdfLoadingTask = loadingTask;

            $('#spinner').addClass('spinner');
            $('#download_btn').css('visibility', 'visible');
            $('#download_btn').attr("href", params.url);
            $('#intro').css('visibility', 'hidden');

            loadingTask.onProgress = function (progressData) {
                self.progress(progressData.loaded / progressData.total);
            };

            let render_page = function (self, page_number, canvas) {
                self.pdfDocument.getPage(page_number).then(function (page) {
                    // We increase the PDF size by a factor to get a higher-quality rendering.
                    const virtualScale = 3.0;

                    // What are the dimensions of the higher-res PDF?
                    const availableHeight = self.pdfViewer.offsetHeight;
                    var viewport = page.getViewport({
                        scale: virtualScale,
                    })
                    const pdfHeight = viewport.height;
                    const pdfWidth = viewport.width;

                    // How to get from available size to the PDF size?
                    const toFullSize = availableHeight / pdfHeight;

                    // We create now a canvas with dimensions that fit on the screen.
                    var ctx = canvas.getContext('2d');
                    canvas.height = availableHeight;
                    canvas.width = pdfWidth * toFullSize;
                    // Make sure the background is white.
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // We render the too big PDF in the small canvas.
                    page.render({
                        canvasContext: canvas.getContext('2d'),
                        viewport: viewport
                    });

                    // As the PDF would be too big, we scale it down again (toFullSize < 1).
                    ctx.scale(toFullSize, toFullSize);

                    // Remember the width for the horizontal scrolling.
                    self.page_width = canvas.width;


                });
            };

            $('canvas').remove();

            return loadingTask.promise.then(function (pdfDocument) {
                self.pdfDocument = pdfDocument;
                self.pdfViewer = document.getElementById('pdf-viewer');

                let page_numbers = Array.from(Array(pdfDocument.numPages), (_, i) => i + 1)

                if (self.pdfPages) {
                    page_numbers = self.pdfPages.split(',');
                }

                for (i in page_numbers) {
                    canvas = document.createElement("canvas");
                    canvas.className = 'pdf-page-canvas';
                    self.pdfViewer.appendChild(canvas);
                    render_page(self, parseInt(page_numbers[i]), canvas);
                }

                self.loading_finished();
            },
                function (exception) {
                    var message = exception && exception.message;
                    $('#intro').css('visibility', 'visible');
                    $('#intro').html(message + " in " + self.pdfUrl);
                }).then(function () {

                    $("body").scrollLeft(0);
                    self.current_page_number = 0;
                    self.loading_finished();
                });
        },
    };

    $("#right_btn").click(function (e) {
        e.stopPropagation();
        SheetApp.scroll_to_page(SheetApp.current_page_number + 1);
    });

    $("#left_btn").click(function (e) {
        e.stopPropagation();
        SheetApp.scroll_to_page(SheetApp.current_page_number - 1);
    });

    $("#refresh_btn").click(function (e) {
        e.stopPropagation();
        Results.load();
    });

    $("#search_btn").click(function (e) {
        if (dialogs.active_dialog() === undefined) {
            e.stopPropagation();
            dialogs.show(0);
        }
    });

    $("#help-dialog_btn").click(function (e) {
        if (dialogs.active_dialog() === undefined) {
            e.stopPropagation();
            dialogs.show(1);
        }
    });

    $("#upload-dialog_btn").click(function (e) {
        if ($("body").data('upload') == "enabled") {
            if (dialogs.active_dialog() === undefined) {
                e.stopPropagation();
                dialogs.show(2);
            }
        }
    });

    var Results = {
        data: [],
        q_old: null,
        found_items: [],
        item_idx: -1,
        current_params_: null,

        load: function () {
            var self = this;
            $.getJSON("/sheets.json", function (data) {

                // Add latent fields to support queries like "sonatelem" and "telemsona" to
                // match "Sonata Telemann".
                var data_enhanced = data.map(function (el) {
                    var o = Object.assign({}, el);
                    o.title_artist = el.title + " " + el.artist;
                    o.artist_title = el.artist + " " + el.title;
                    return o;
                })

                self.data = data_enhanced;
                $("#num_sheets").text(data.length + ' Sheets');
                $("#status_num_sheets").text(data.length + ' Sheets');
            });
        },

        current_params: function () {
            return this.current_params_;
        },

        length: function () {
            return this.data.length;
        },

        current: function () {
            return this.item_idx;
        },

        select_entry: function (n) {
            this.item_idx = Math.min(this.found_items.length - 1, Math.max(0, n))

            $("li[class='active']").removeClass('active');
            $("li").eq(this.item_idx).addClass("active");

            var current_offset = $("li[class='active']").offset();
            if (current_offset !== undefined) {
                $("ul").scrollTop(
                    current_offset.top - $("ul").offset().top + $("ul").scrollTop()
                );
            }

            let a = $(".active");
            this.current_params_ = {
                url: a.data('url'),
                artist: a.data('artist'),
                title: a.data('title'),
                pages: a.data('pages'),
            }
        },

        draw_list: function (items) {
            $("#list-viewer ul li").remove();

            $.each(items, function (index, value) {
                let title = value.obj.title;
                let artist = value.obj.artist;
                // TODO(patwie): Fix the issue with the highlight of latent fields.
                let title_highlight = fuzzysort.highlight(value[0]) || value.obj.title;
                let artist_highlight = fuzzysort.highlight(value[1]) || value.obj.artist;
                let url = value.obj.url;
                let pages = value.obj.pages;

                $("#list-viewer ul").append('<li data-url="' + url + '"  data-title="' + title + '"  data-artist="' + artist + '" data-pages="' + pages + '">' + title_highlight + '<small>' + artist_highlight + '</small></li>');

            });

            $('li').click(function (e) {
                var params = {
                    url: $(this).data('url'),
                    artist: $(this).data('artist'),
                    title: $(this).data('title'),
                    pages: $(this).data('pages'),
                }

                SheetApp.open(params);
            });
        },

        build_list: function (q) {
            var self = this;
            var select_first_entry = false;

            if (self.found_items.length === 0) {
                select_first_entry = true
            }

            if (q.length > 0) {
                if (q != this.old_q) {
                    this.old_q = q;
                    self.found_items = fuzzysort.go(q.trim(), self.data, {
                        keys: ['title', 'artist', 'title_artist', 'artist_title'],
                        allowTypo: true
                    })
                    self.item_idx = -1

                    this.draw_list(self.found_items);
                    select_first_entry = true
                }
            } else {
                // show default 10 entries
                var self = this;
                max_display_items = 10

                self.found_items = []
                $.each(self.data, function (index, value) {

                    // if (index > max_display_items) {
                    //     return false;
                    // }

                    self.found_items.push({
                        obj: {
                            title: value.title,
                            artist: value.artist,
                            url: value.url,
                            pages: value.pages,
                        },
                        0: null,
                        1: null,
                    })
                });

                this.draw_list(self.found_items);
            }

            if (select_first_entry) {
                this.select_entry(0);
            }
        }
    };

    Results.load();

    dialogs = new Dialogs();
    dialogs.push(new PromptDialog($('#prompt-dialog')), 'p');
    dialogs.push(new Dialog($('#help-dialog')), 'h');

    if ($("body").data('upload') == "enabled") {
        $("#upload-dialog_btn").css('visibility', 'visible');
        dialogs.push(new UploadDialog($('#upload-dialog')), 'u');
    } else {
        $("#upload-dialog_btn").css('visibility', 'hidden');
    }

    $(document).on('keyup', function (e) {
        let active_dialog = dialogs.active_dialog();

        if (active_dialog !== undefined) {
            active_dialog.on_key_up(e);

            if (e.which == 27) {
                // esc
                e.preventDefault();
                active_dialog.hide();
                dialogs.active_idx = -1;
            }
        } else {
            SheetApp.on_key_up(e);
            dialogs.on_key_up(e);
        }
    })

    $('html').click(function () {

        let active_dialog = dialogs.active_dialog();
        if (active_dialog !== undefined) {
            active_dialog.hide();
            dialogs.active_idx = -1;
        }
    });
});
