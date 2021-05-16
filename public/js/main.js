var params = URLSearchParams && new URLSearchParams(document.location.search.substring(1));
var url = params && params.get("url") && decodeURIComponent(params.get("url"));
var currentSectionIndex = (params && params.get("loc")) ? params.get("loc") : undefined;

// Load the opf
var book = ePub(url || "https://s3.amazonaws.com/moby-dick/moby-dick.epub");
var rendition = book.renderTo("viewer", {
    width: "100%",
    height: 450,
    spread: "always"
});

rendition.display(currentSectionIndex);

book.ready.then(() => {
    var next = document.getElementById("next");
    next.addEventListener("click", function (e) {
        book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
        e.preventDefault();
    }, false);

    var prev = document.getElementById("prev");
    prev.addEventListener("click", function (e) {
        book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
        e.preventDefault();
    }, false);

    var keyListener = function (e) {
        // Left Key
        if ((e.keyCode || e.which) == 37) {
            book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
        }
        // Right Key
        if ((e.keyCode || e.which) == 39) {
            book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
        }
    };

    rendition.on("keyup", keyListener);
    document.addEventListener("keyup", keyListener, false);
})

var title = document.getElementById("title");
rendition.on("rendered", function (section) {
    var current = book.navigation && book.navigation.get(section.href);

    if (current) {
        var $select = document.getElementById("toc");

        var $selected = $select.querySelector("option[selected]");
        if ($selected) {
            $selected.removeAttribute("selected");
        }

        var $options = $select.querySelectorAll("option");
        for (var i = 0; i < $options.length; ++i) {
            let selected = $options[i].getAttribute("ref") === current.href;
            if (selected) {
                $options[i].setAttribute("selected", "");
            }
        }
    }
});

rendition.on("relocated", function (location) {
    console.log(location);
    var next = book.package.metadata.direction === "rtl" ? document.getElementById("prev") : document.getElementById("next");
    var prev = book.package.metadata.direction === "rtl" ? document.getElementById("next") : document.getElementById("prev");

    if (location.atEnd) {
        next.style.visibility = "hidden";
    } else {
        next.style.visibility = "visible";
    }

    if (location.atStart) {
        prev.style.visibility = "hidden";
    } else {
        prev.style.visibility = "visible";
    }
});

rendition.on("layout", function (layout) {
    let viewer = document.getElementById("viewer");

    if (layout.spread) {
        viewer.classList.remove('single');
    } else {
        viewer.classList.add('single');
    }
});

window.addEventListener("unload", function () {
    console.log("unloading");
    this.book.destroy();
});

book.loaded.navigation.then(function (toc) {
    var $select = document.getElementById("toc"),
        docfrag = document.createDocumentFragment();

    toc.forEach(function (chapter) {
        var option = document.createElement("option");
        option.textContent = chapter.label;
        option.setAttribute("ref", chapter.href);
        docfrag.appendChild(option);
    });

    $select.appendChild(docfrag);

    $select.onchange = function () {
        var index = $select.selectedIndex,
            url = $select.options[index].getAttribute("ref");
        rendition.display(url);
        return false;
    };
});

// Aplicar una clase al texto seleccionado
rendition.on("selected", function (cfiRange, contents) {
    rendition.annotations.highlight(cfiRange, {}, (e) => {
        console.log("highlight clicked", e.target);
    });
    contents.window.getSelection().removeAllRanges();
});

this.rendition.themes.default({
    '::selection': {
        'background': 'rgba(255,255,0, 0.3)'
    },
    '.epubjs-hl': {
        'fill': 'yellow',
        'fill-opacity': '0.3',
        'mix-blend-mode': 'multiply'
    }
});

// Conseguir el texto guardado del cfiRange
var highlights = document.getElementById('highlights');
rendition.on("selected", function (cfiRange) {
    book.getRange(cfiRange).then(function (range) {
        var contador = $('#contador').val();
        var text;
        var tr = document.createElement('tr');
        tr.setAttribute("id", "fila" + contador);

        var tdOrden = document.createElement('td');
        var tdResaltado = document.createElement('td');
        tdResaltado.setAttribute("id", "resaltado" + contador);
        
        var tdLink = document.createElement('td');
        var tdAnotacion = document.createElement('td');
        var tdEliminar = document.createElement('td');

        var a = document.createElement('a');
        var anotation = document.createElement('button');
        var remove = document.createElement('button');
        var textNode;

        if (range) {

            tdOrden.textContent = contador;
            tdOrden.setAttribute("class", "orden");
            text = range.toString();
            textNode = document.createTextNode(text);

            a.textContent = "Ir";
            a.href = "#" + cfiRange;
            a.onclick = function () {
                rendition.display(cfiRange);
            };

            remove.textContent = "eliminar" + contador;
            remove.setAttribute("class", "btn btn-danger");
            remove.onclick = function () {
                rendition.annotations.remove(cfiRange);

                var id_sel = remove.textContent.slice(8);
                $('#seleccion').val(id_sel);

                //eliminar la fila del html
                $('#fila' + id_sel + '').remove();
                return false;
            };

            anotation.textContent = "anotar" + contador;
            anotation.setAttribute("class", "btn btn-info");

            anotation.onclick = function () {
                //llamar a una caja de texto para las anotaciones y un boton de envio de data
                $('.btn').popover({
                    content: "<div class='input-group mb-3'><input type='text' class='form-control' " +
                        "placeholder='Escriba la anotación' aria-label='Escriba la anotación' " +
                        "aria-describedby='button-addon2'><button onclick='enviarAnotacion();' " +
                        "class='btn btn-outline-secondary' type='button' id='button-addon2'>Enviar</button></div>",
                    placement: "bottom",
                    html: true
                });
                var id_sel = anotation.textContent.slice(6)
                $('#seleccion').val(id_sel);
            };

            tdResaltado.appendChild(textNode);
            tdLink.appendChild(a);
            tdAnotacion.appendChild(anotation);
            tdEliminar.appendChild(remove);

            tr.appendChild(tdOrden);
            tr.appendChild(tdResaltado);
            tr.appendChild(tdLink);
            tr.appendChild(tdAnotacion);
            tr.appendChild(tdEliminar);

            highlights.appendChild(tr);

            contador++
            $('#contador').val(contador);
        }
    })
});

window.accionarResaltado = function () {
    console.log("se acciona el evento");
};

window.enviarAnotacion = function () {
    // console.log("alola "+$('.form-control').val());    
    if ($('.form-control').val().trim() == "") {
        console.log("NO HAY TEXTO");
    } else {
        console.log("se envia la anotacion");
        var anotaciones = document.getElementById('anotaciones');

        var a = document.createElement('a');
        a.href = "#";
        a.setAttribute("class", "list-group-item list-group-item-action active py-3 lh-tight");
        a.setAttribute("aria-current", true);

        var tit_anot = document.createElement('div');
        tit_anot.setAttribute("class", "d-flex w-100 align-items-center justify-content-between");

        var con_anot = document.createElement('div');
        con_anot.setAttribute("class", "col-10 mb-1 small");

        /*anotacion*/
        var anotacionTexto = $('.form-control').val();
        con_anot.textContent = anotacionTexto;
        var strong = document.createElement('strong');
        strong.setAttribute("class", "mb-1")

        /*resaltado*/
        var id_sel = $('#seleccion').val();
        var resaltadoTexto = $('#resaltado' + id_sel + '').text();
        strong.textContent = resaltadoTexto;
        var small = document.createElement('small');

        /*id*/
        var ordenTexto = $('.orden').val();
        small.textContent = ordenTexto;

        tit_anot.appendChild(strong);
        tit_anot.appendChild(small);

        a.appendChild(tit_anot);
        a.appendChild(con_anot);

        anotaciones.appendChild(a);
    }
};
