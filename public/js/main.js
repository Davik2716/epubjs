var params = URLSearchParams && new URLSearchParams(document.location.search.substring(1));
var url = params && params.get("url") && decodeURIComponent(params.get("url"));
var currentSectionIndex = (params && params.get("loc")) ? params.get("loc") : undefined;

var mi_rango = [];
var mi_indice = [];

// Load the opf
// var book = ePub(url || "https://s3.amazonaws.com/moby-dick/moby-dick.epub");
// var book = ePub("https://qillqa.pe/publico/img_data/JUNIOR_LO%20MEJOR%20DE%20LO%20MEJOR%202020.epub");
// var book = ePub("libros_qillqa/Ancón_Santiago_Tácunan_Bonifacio_Luis_Alberto_Torrejón_Rengifo.epub");
var book = ePub("libros_qillqa/JUNIOR_LO MEJOR DE LO MEJOR 2020.epub");
var rendition = book.renderTo("viewer", {
    width: "100%",
    height: "100%",
    // height: 450,
    spread: "always"
});

rendition.display(currentSectionIndex);

book.ready.then(() => {
    var next = document.getElementById("next");
    next.addEventListener("click", function (e) {
        book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
        cambiarFondo(document.getElementById("fondo").value)
        e.preventDefault();
    }, false);

    var prev = document.getElementById("prev");
    prev.addEventListener("click", function (e) {
        book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
        cambiarFondo(document.getElementById("fondo").value)
        e.preventDefault();
    }, false);

    var keyListener = function (e) {
        // Left Key
        if ((e.keyCode || e.which) == 37) {
            book.package.metadata.direction === "rtl" ? rendition.next() : rendition.prev();
            cambiarFondo(document.getElementById("fondo").value)
        }
        // Right Key
        if ((e.keyCode || e.which) == 39) {
            book.package.metadata.direction === "rtl" ? rendition.prev() : rendition.next();
            cambiarFondo(document.getElementById("fondo").value)
        }
        // Ctrl + Z Key
        if (e.ctrlKey && (e.keyCode || e.which) == 90) {
            var f = mi_indice[mi_indice.length - 1]
            // eliminar el resaltado y la fila
            rendition.annotations.remove(mi_rango[mi_rango.length - 1]);
            $('#fila' + f + '').remove();
            // eliminar los elementos de los array
            mi_rango.splice(mi_rango.length - 1, 1)
            mi_indice.splice(mi_indice.length - 1, 1)
        }
        // Ctrl + Q Key
        if (e.ctrlKey && (e.keyCode || e.which) == 81) {
            // var elem = document.getElementsByClassName("epub-view");
            var elem = document.getElementById("viewer");
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            }
        }
        // + Key
        if ((e.keyCode || e.which) == 107) {
            var tam = parseInt(document.getElementById("tamano").value)
            if (tam < 26) {
                cambiarTamano("+")
            }
        }
        // - Key
        if ((e.keyCode || e.which) == 109) {
            var tam = parseInt(document.getElementById("tamano").value)
            if (tam > 8) {
                cambiarTamano("-")
            }
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
        cambiarFondo(document.getElementById("fondo").value)
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

// var color_resaltador = document.getElementById("resaltador").value
// alert("este"+color_resaltador)
// this.rendition.themes.default({
//     '::selection': {
//         // color mientras se selecciona
//         // 'background': definirColor()
//         // 'background': "red, 0.3"
//         'background': 'rgba(255,0,0, 0.3)'      // red
//         // 'background': 'rgba(255,255,0, 0.3)'    // amarillo
//         // 'background': 'rgb(0, 128, 0, 0.3)'     // verde
//         // 'background': 'rgb(0, 0, 255, 0.3)'     // azul
//         // 'background': 'rgb(64, 224, 208, 0.3)'  // turquesa
//     }
//     // ,
//     // '.epubjs-hl': {
//     //     'fill': 'yellow',
//     //     'fill-opacity': '0.3',
//     //     'mix-blend-mode': 'multiply'
//     // }
// });

// Conseguir el texto guardado del cfiRange
var highlights = document.getElementById('highlights');
rendition.on("selected", function (cfiRange) {
    // quitar este bloque
    rendition.themes.default({
        '::selection': {
            'background': definirColor()
        }
    });

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

            // guardar el rango en una variable global
            mi_rango.push(cfiRange)
            mi_indice.push(contador)
            // $('#rango').val($('#rango').val()+1);

            remove.textContent = "eliminar" + contador;
            remove.setAttribute("class", "btn btn-danger");
            remove.onclick = function () {
                rendition.annotations.remove(cfiRange);

                // eliminar la fila seleccionada
                var id_sel = remove.textContent.slice(8);
                $('#seleccion').val(id_sel);

                //eliminar la fila del html
                $('#fila' + id_sel + '').remove();

                // restaurar el contador    -> NO USARLO POR AHORA
                // $('#contador').val($('#contador').val()-1);
                var i = mi_indice.indexOf(id_sel);
                if (i !== -1) {
                    mi_indice.splice(i, 1);
                    mi_rango.splice(i, 1);
                }
                return false;
            };

            anotation.textContent = "anotar" + contador;
            anotation.setAttribute("class", "btn btn-secondary");

            anotation.onclick = function () {
                //llamar a una caja de texto para las anotaciones y un boton de envio de data
                $('.btn-secondary').popover({
                    content: "<div class='input-group mb-3'><input type='text' class='form-control' " +
                        "placeholder='Escriba la anotación' aria-label='Escriba la anotación' " +
                        "aria-describedby='button-addon2'><button onclick='enviarAnotacion();' " +
                        "class='btn btn-outline-secondary' type='button' id='button-addon2'>Enviar</button></div>",
                    placement: "auto",
                    //trigger: "focus",
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
            // $('#rango').val(contador);
        }
    })
});

window.accionarResaltado = function () {
    console.log("se acciona el evento");
};

window.enviarAnotacion = function () {
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
        con_anot.setAttribute("class", "d-flex w-100 align-items-center justify-content-between small");

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

        var idpopover = $(".popover").attr("id");
        console.log(idpopover);
        var element = document.getElementById(idpopover);
        // elimina un elemento y se puede usar para eliminar anotaciones
        element.remove();
    }
};

// cambiar el color del resaltador
function definirColor() {
    var color = document.getElementById("resaltador").value
    var bk
    switch (color) {
        case "yellow":
            bk = 'rgba(255,255,0, 0.3)'
            break;
        case "green":
            bk = 'rgba(0, 128, 0, 0.3)'
            break;
        case "blue":
            bk = 'rgba(0, 0, 255, 0.3)'
            break;
        case "turquoise":
            bk = 'rgb(64, 224, 208, 0.3)'
            break;
    }
    return bk
}

// Cambiar el color del resaltador
$(function () {
    // guardar el color en la caja de texto
    $("#yellow").click(function () {
        $('#resaltador').val("yellow")
    });
    $("#green").click(function () {
        $('#resaltador').val("green")
    });
    $("#blue").click(function () {
        $('#resaltador').val("blue")
    });
    $("#turquoise").click(function () {
        $('#resaltador').val("turquoise")
    });
});

function cambiarFondo(color) {
    var id = $("iframe").attr("id");
    var iframe = document.getElementById(id);
    var x = iframe.contentDocument;

    switch (color) {
        case "blanco":
            iframe.style.backgroundColor = "white";
            iframe.style.color = "black";
            x.body.style.backgroundColor = "white";
            x.body.style.color = "black";
            break;
        case "negro":
            iframe.style.backgroundColor = "rgb(20, 20, 20)";
            iframe.style.color = "white";
            x.body.style.backgroundColor = "rgb(20, 20, 20)";
            x.body.style.color = "white";
            break;
        case "sepia":
            iframe.style.backgroundColor = "rgb(247, 241, 207)";
            iframe.style.color = "rgb(119, 76, 39)";
            x.body.style.backgroundColor = "rgb(247, 241, 207)";
            x.body.style.color = "rgb(119, 76, 39)";
            break;
        case "azuloscuro":
            iframe.style.backgroundColor = "rgb(87, 107, 150)";
            iframe.style.color = "rgb(221, 221, 221)";
            x.body.style.backgroundColor = "rgb(87, 107, 150)";
            x.body.style.color = "rgb(221, 221, 221)";
            break;
        case "azulclaro":
            iframe.style.backgroundColor = "rgb(221, 221, 221)";
            iframe.style.color = "rgb(87, 107, 150)";
            x.body.style.backgroundColor = "rgb(221, 221, 221)";
            x.body.style.color = "rgb(87, 107, 150)";
            break;
    }
}

function cambiarTamano(signo) {
    var id = $("iframe").attr("id");
    var iframe = document.getElementById(id);
    var x = iframe.contentDocument;
    var tam = parseInt(document.getElementById("tamano").value)
    if (signo == "+") {
        tam++
    } else if (signo == "-") {
        tam--
    }
    x.body.style.fontSize = tam + "px";
    $('#tamano').val(tam)
}

//Cambiando colores de fondo
$(function () {
    /*Cambiando css*/
    $("#btnFondoBlanco").click(function () {
        $('#fondo').val("blanco")
        cambiarFondo(document.getElementById("fondo").value)
    });
    $("#btnFondoNegro").click(function () {
        $('#fondo').val("negro")
        cambiarFondo(document.getElementById("fondo").value)
    });
    $("#btnFondoSepia").click(function () {
        $('#fondo').val("sepia")
        cambiarFondo(document.getElementById("fondo").value)
    });
    $("#btnFondoAzulOscuro").click(function () {
        $('#fondo').val("azuloscuro")
        cambiarFondo(document.getElementById("fondo").value)
    });
    $("#btnFondoAzulClaro").click(function () {
        $('#fondo').val("azulclaro")
        cambiarFondo(document.getElementById("fondo").value)
    });

    // cambiando el tamaño de fuente
    $("#btnmas").click(function () {
        var tam = parseInt(document.getElementById("tamano").value)
        if (tam < 26) {
            cambiarTamano("+")
        }
    });
    $("#btnmenos").click(function () {
        var tam = parseInt(document.getElementById("tamano").value)
        if (tam > 8) {
            cambiarTamano("-")
        }
    });

    // pantalla completa    
    $("#btnPanCom").click(function () {
        var elem = document.getElementById("viewer");
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        }
    });

    // mostrar/ocultar indice
    $("#btnIndice").click(function () {
        var x = document.getElementById("toc");
        if (x.style.display === "none") {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    });
});

// Corregir los estilos al cambiar de hoja o de sección
window.setInterval(function () {
    cambiarFondo(document.getElementById("fondo").value)
    var tam = parseInt(document.getElementById("tamano").value)
    document.getElementById($("iframe").attr("id")).contentDocument.body.style.fontSize = tam + "px";
}, 50);