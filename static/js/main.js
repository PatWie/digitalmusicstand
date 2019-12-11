var thePdf = null;
var result_id = 0;
var result_len = 0;

var current_page = 0;
var num_pages = 0;
var page_width = 0;

var old_q = '';

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

function renderPDF(url) {
    $('#query').blur();
    $('#prompt').css('visibility', 'hidden');
    $('#intro').css('visibility', 'visible');
    $('#intro').html('Loading ...');

    thePdf = null;
    $('canvas').remove();
    pdfjsLib.getDocument(url).promise.then(function(pdf) {
        thePdf = pdf;
        viewer = document.getElementById('pdf-viewer');
        for (page = 1; page <= pdf.numPages; page++) {
            canvas = document.createElement("canvas");
            canvas.className = 'pdf-page-canvas';
            viewer.appendChild(canvas);
            renderPage(page, canvas);
        }
        num_pages = pdf.numPages
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

        $('#prompt').css('visibility', 'visible');
        $('#query').focus();
        $('#query').select();
    }
}

$(function() {

    let objects = []

    $.getJSON("/sheets.json", function(data) {
        objects = data;
        result_len = data.length;
    });

    function score(a) {
        return (a[0] ? a[0].score : -1000000) + (a[1] ? a[1].score : -100000000);
    }

    // $('#search_btn').click(function(e) {
    //     e.preventDefault();
    //     showQueryBar(e)
    // });

    $("#query").keyup(function() {
        let q = $("#query").val();

        if (q.length > 0) {
            if (q != old_q) {
                old_q = q;
                let results = fuzzysort.go(q, objects, {
                    keys: ['title', 'artist'],
                    scoreFn: score,
                    allowTypo: true
                })

                result_len = objects.length

                $("ul li").remove();

                $.each(results, function(index, value) {
                    let title = fuzzysort.highlight(value[0]) || value.obj.title;
                    let artist = fuzzysort.highlight(value[1]) || value.obj.artist;
                    let url = value.obj.url;
                    $("ul").append('<li data-url="' + url + '">' + title + '<small>' + artist + '</small></li>');
                });
                selectNthEnty(0);

                $('li').click(function(e) {
                    renderPDF($(this).data('url'))
                });
            }

        } else {
            result_len = 0
        }


    });




    $(document).on('keyup', function(e) {
        // console.log(e.which)

        if (e.which == 49) { // e.which == 37 ||
            e.preventDefault();
            scroll2page(current_page - 1)
        }

        if (e.which == 50) { // e.which == 39 ||
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
        }
        if (e.which == 13) {
            // enter/return
            // renderPDF('/sheets/speechless.pdf');
            if ($('#prompt').css('visibility') === 'hidden') {
                // do nothing
            } else {
                // change pdf
                renderPDF($(".active").data('url'))
            }
        }
        if (e.key == 'p') {
            showQueryBar(e);
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

    $("#refresh_btn").click(function(e) {
        e.stopPropagation();
        $.getJSON("/sheets.json", function(data) {
            objects = data;
            result_len = data.length;
        });
    });

    $('html').click(function() {
        $('#prompt').css('visibility', 'hidden');
    });
});