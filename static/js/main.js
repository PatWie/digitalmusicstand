var thePdf = null;
var result_id = 0;
var result_len = 0;
var pdf_url = null;

var current_page = 0;
var num_pages = 0;
var page_width = 0;

var old_q = '';

var objects = []

function scroll2page(target_page) {

    if (num_pages > 0 && $("canvas").eq(target_page) !== undefined) {
        if (target_page >= 0) {
            if (target_page < num_pages) {
                var container = $("body")
                var target = $("canvas").eq(target_page)

                current_page = target_page;

                // var offset = target.position().left - container.position().left;
                var offset = container.position().left + target_page * (page_width + 2)
                    // container.scrollLeft();

                container.animate({
                    scrollLeft: offset
                }, 1000);


            }
        }
    }
}

function renderPDF(url, title, artist) {
    $("#status_title").text(title);
    $("#status_artist").text(artist);
    $('#query').blur();
    $('#prompt').css('visibility', 'hidden');


    $('#spinner').addClass('spinner');
    $('#download_btn').css('visibility', 'visible');
    $('#download_btn').attr("href", url);
    // $('#intro').click();

    pdf_url = url;
    thePdf = null;
    $('canvas').remove();
    pdfjsLib.getDocument(url).promise.then(function(pdf) {
        thePdf = pdf;
        viewer = document.getElementById('pdf-viewer');
        for (number_page = 1; number_page <= pdf.numPages; number_page++) {
            canvas = document.createElement("canvas");
            canvas.className = 'pdf-page-canvas';
            viewer.appendChild(canvas);
            renderPage(number_page, canvas);
        }
        num_pages = pdf.numPages
    }).then(function() {
        $('#spinner').removeClass('spinner');
    });

    $("body").scrollLeft(0);
    current_page = 0;
    $('#intro').css('visibility', 'hidden');



}

function renderPage(pageNumber, canvas) {
    thePdf.getPage(pageNumber).then(function(page) {
        const scale = viewer.offsetHeight / page.getViewport({
            scale: 1.0,
        }).height;

        viewport = page.getViewport({
            scale: scale,
        });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        page.render({
            canvasContext: canvas.getContext('2d'),
            viewport: viewport
        });
        page_width = canvas.width;
    });
}

function selectNthEnty(n) {
    if (result_len > 0) {
        if (n >= 0) {
            if (n < result_len) {
                $("li[class='active']").removeClass('active');
                result_id = n;
                $("li").eq(n).addClass("active");


                $("ul").scrollTop(
                    $("li[class='active']").offset().top - $("ul").offset().top + $("ul").scrollTop()
                );
            }
        }

    }
}

function showQueryBar(e) {

    if ($('#prompt').css('visibility') === 'hidden') {
        e.preventDefault();

        $('#help').css('visibility', 'hidden');
        $('#prompt').css('visibility', 'visible');
        $('#query').focus();
        $('#query').select();
        if ($("#query").val() == '') {
            on_query()
        }
    }
}

function on_query() {
    let q = $("#query").val();

    if (q.length > 0) {
        if (q != old_q) {
            old_q = q;
            let results = fuzzysort.go(q, objects, {
                keys: ['title', 'artist'],
                // scoreFn: score,
                allowTypo: true
            })

            result_len = objects.length

            $("ul li").remove();

            $.each(results, function(index, value) {
                let title = value.obj.title;
                let artist = value.obj.artist;

                let title_highlight = fuzzysort.highlight(value[0]) || value.obj.title;
                let artist_highlight = fuzzysort.highlight(value[1]) || value.obj.artist;
                let url = value.obj.url;
                $("ul").append('<li data-url="' + url + '"  data-title="' + title + '"  data-artist="' + artist + '">' + title_highlight + '<small>' + artist_highlight + '</small></li>');
            });
            selectNthEnty(0);

            $('li').click(function(e) {
                renderPDF($(this).data('url'), $(this).data('title'), $(this).data('artist'))

            });
        }

    } else {
        $("ul li").remove();

        result_len = 10
        $.each(objects, function(index, value) {

            if (index > result_len) {
                return false;
            }
            let title = value.title;
            let artist = value.artist;
            let url = value.url;
            $("ul").append('<li data-url="' + url + '"  data-title="' + title + '"  data-artist="' + artist + '">' + title + '<small>' + artist + '</small></li>');
        });

        $('li').click(function(e) {
            renderPDF($(this).data('url'), $(this).data('title'), $(this).data('artist'))

        });
    }


}

$(function() {



    $.getJSON("/sheets.json", function(data) {
        objects = data;
        result_len = data.length;
        $("#num_sheets").text(data.length + ' Sheets');
        $("#status_num_sheets").text(data.length + ' Sheets');
    });

    function score(a) {
        return defaultScoreFn(a[0]) + defaultScoreFn(a[1])
    }

    $("#query").keyup(on_query);




    $(document).on('keyup', function(e) {
        // console.log(e.which)

        if (e.which == 37 || e.which == 49) { //
            e.preventDefault();
            scroll2page(current_page - 1)
        }

        if (e.which == 39 || e.which == 50) { //
            e.preventDefault();
            scroll2page(current_page + 1)
        }

        if (e.which == 40) {
            // arrow up
            e.preventDefault();
            selectNthEnty(result_id + 1);
        }
        if (e.which == 38) {
            // arrow down
            e.preventDefault();
            selectNthEnty(result_id - 1);
        }
        if (e.which == 27) {
            // esc
            e.preventDefault();
            $('#query').blur();
            $('#prompt').css('visibility', 'hidden');
            $('#help').css('visibility', 'hidden');
        }
        if (e.which == 13) {
            // enter/return
            // renderPDF('/sheet/speechless.pdf');
            if ($('#prompt').css('visibility') === 'hidden') {
                // do nothing
            } else {
                // change pdf
                let a = $(".active");
                renderPDF(a.data('url'), a.data('title'), a.data('artist'))

            }
        }
        if (e.key == 'p') {
            showQueryBar(e);
        }
        if (e.key == 'h') {
            if ($('#prompt').css('visibility') === 'hidden') {
                $('#help').css('visibility', 'visible');
            }
        }


    });
    $("#prompt").click(function(e) {
        e.stopPropagation();
    });

    $("#search_btn").click(function(e) {
        e.stopPropagation();
        showQueryBar(e)
    });

    $("#left_btn").click(function(e) {
        e.stopPropagation();
        scroll2page(current_page - 1)
    });

    $("#right_btn").click(function(e) {
        e.stopPropagation();
        scroll2page(current_page + 1)
    });

    $("#help_btn").click(function(e) {
        e.stopPropagation();
        $('#help').css('visibility', 'visible');
    });

    $("#refresh_btn").click(function(e) {
        e.stopPropagation();
        $.getJSON("/sheets.json", function(data) {
            objects = data;
            result_len = data.length;
        });
    });

    $('html').click(function() {
        $('#prompt').css('visibility', 'hidden');
        $('#help').css('visibility', 'hidden');
    });
});