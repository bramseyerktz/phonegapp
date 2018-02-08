/**
 * Created by bramseyer on 17/03/16.
 */
$( document ).ready(function() {

var btnEntrada = $("#btnEntrada").hide(),
    btnSalida = $("#btnSalida").hide(),
    gifLoading = $("#gifLoading").show(),
    userInvalid = $("#userInvalid").hide(),
    divSalida = $("#divSalida").hide(),
    btnChangeUser = $("#btnChangeUser").hide(),
    tooFast = $("#tooFast").hide(),
    btnIrAUrl = $("#btnIrAUrl").hide(),
    btnAlarma = $("#btnAlarma").hide(),
    formCalcular = $("#formCalcular").hide(),
    txtPass = $("#pass"),
    txtUser = $("#user"),
    txtMinutoAlarma = $("#minutoAlarma"),
    btnConsulta = $("#btnConsulta"),
    esEntrada = true;

prepareForm();

function prepareForm(){

    if (localStorage.userNameFichaje != null) {
        if (localStorage.minuteToAlarm != null) {
            txtMinutoAlarma.val(localStorage.minuteToAlarm);
        } else {
            txtMinutoAlarma.val(10);
        }

        txtPass.hide();
        txtUser.val(localStorage.userNameFichaje);
        txtUser.prop('disabled', true);
        showCorrectButton();
    } else {
        txtPass.show();
        btnConsulta.show();
        gifLoading.hide();
    }
}

function loadingElements() {
    btnConsulta.hide();
    txtPass.hide();
    tooFast.hide();
    formCalcular.hide();
    gifLoading.show();
    btnChangeUser.show();
    txtUser.prop('disabled', true);
}

function userInvalidElements() {
    userInvalid.show();
    gifLoading.hide();
    btnEntrada.hide();
    btnSalida.hide();
    btnIrAUrl.hide();
    btnAlarma.hide();
    formCalcular.hide();
}

function validateUser(){
    //var url = 'http://intranet.kinexo.com/wp-login.php';
    var url = 'http://sug.kinexo.com/Account/Login';
    $.ajax({
        url: url,
        //data: {log: txtUser.val(), pwd: txtPass.val()},
        //data: {UserName: txtUser.val(), Password: txtPass.val()},
        type: 'GET',
        async: false,
        success: function (data) {
            //simular login por page

            var frm = $($.parseHTML(data)).find("#box-login");
            frm.find("#UserName").val(txtUser.val());
            frm.find("#Password").val(txtPass.val());

            $.ajax({
                type: frm.attr('method'),
                url: "http://sug.kinexo.com/Account/Login?ReturnUrl=%2fFichajes%2fListaFichajes",
                data: frm.serialize(),
                success: function () {
                    showCorrectButton();
                },
                error: function () {
                    userInvalidElements();
                }
            });
        },
        error: function () {
            userInvalidElements();
        }
    })
}

function showCorrectButton(){
    //var url = 'http://controlhoras.kinexo.com/Fichajes/ListaFichajes/?username='  + txtUser.val();
    var url = 'http://sug.kinexo.com/Fichajes/ListaFichajes';

    loadingElements();
    $.ajax({
            url: url,
            async: false
            //datatype: 'html'
        })
        .done(function (result){
            esEntrada = true;
            var userInvalid = false;
            //no entra la página entera en data, por eso no encuentra el fichar
            //if (result.indexOf('name="Fichar"') == -1)
            //    userInvalid = true;
            //if (result.indexOf('value="Fichar Salida"') != -1)
            //     esEntrada = false;

            if (result.indexOf('<form action="/Fichajes/') == -1)
                userInvalid = true;

            if (userInvalid) {
                userInvalidElements();
            } else {
                btnIrAUrl.show();
                btnAlarma.show();
                localStorage.userNameFichaje = txtUser.val();
                gifLoading.hide();

                //calculate exit hour
                var start = result.indexOf('<form action="/Fichajes/');
                var end = result.indexOf('<div class="modal fade"') - 1;
                var newHtml = result.substring(start,end);
                $("#oculto").html(newHtml);
                var resultHora = calcularHora();
                if (!esEntrada) {
                    btnEntrada.hide();
                    btnSalida.show();
                    formCalcular.show();
                    divSalida.html('<br>' + resultHora + '<br><br>');
                    divSalida.show();
                    btnChangeUser.show();
                } else {
                    btnSalida.hide();
                    btnEntrada.show();
                }
            }
        });
}

function fichar(buttonToShow) {
    tooFast.hide();
    btnIrAUrl.hide();
    btnAlarma.hide();
    gifLoading.show();
    //var url = 'http://controlhoras.kinexo.com/Fichajes/FicharEntradaSalida/?username='  + txtUser.val();

    var url = 'http://sug.kinexo.com/Fichajes/FicharEntradaSalida?username=&mca=false&imd=false';

    $.ajax({
        url: url,
        method: "GET",
        async: false
    });

    gifLoading.hide();
    btnIrAUrl.show();
    btnAlarma.show();
    buttonToShow.show();
}

btnEntrada.click(function(){
    btnEntrada.hide();

    //CONTROLAR LA HORA CON LOCALSTORAGE
    localStorage.entryHour = new Date();

    if (localStorage.exitHour == null) {
        // seteo fecha entrada si no existe
        localStorage.exitHour = new Date('2014-03-09 01:59:00');
    }
    var entry = new Date(localStorage.entryHour);
    var exit = new Date(localStorage.exitHour);
    exit.setMinutes(exit.getMinutes() + 1);

    if (entry <= exit) {
        //Se muestra msj que no se puede fichar a menos de un minuto
        tooFast.show();
    } else {
        fichar(btnSalida);
        showCorrectButton();
    }
});

btnSalida.click(function(){
    btnSalida.hide();
    divSalida.hide();
    formCalcular.hide();

    //CONTROLAR LA HORA CON LOCALSTORAGE
    localStorage.exitHour = new Date();

    if (localStorage.entryHour == null) {
        // seteo fecha entrada si no existe
        localStorage.entryHour = new Date('2014-03-09 01:59:00');
    }
    var exit = new Date(localStorage.exitHour);
    var entry = new Date(localStorage.entryHour);
    entry.setMinutes(entry.getMinutes() + 1);

    if (exit <= entry) {
        //Se muestra msj que no se puede fichar a menos de un minuto
        tooFast.show();
    } else {
        fichar(btnEntrada);
    }
});


btnConsulta.click(function(){
    loadingElements();
    validateUser();
});

btnIrAUrl.click(function(){
    //var url = 'http://controlhoras.kinexo.com/Fichajes/ListaFichajes/?username='  + txtUser.val();
    var url = 'http://sug.kinexo.com/Fichajes/ListaFichajes';
    //chrome.tabs.create({ url: url });
    window.open(url, '_system');
});

btnChangeUser.click(function(){
    btnChangeUser.hide();
    btnEntrada.hide();
    btnSalida.hide();
    divSalida.hide();
    gifLoading.hide();
    userInvalid.hide();
    tooFast.hide();
    btnIrAUrl.hide();
    btnAlarma.hide();
    formCalcular.hide();

    txtUser.val('');
    txtUser.prop('disabled', false);
    txtPass.val('');
    txtPass.prop('disabled', false);
    txtPass.show();
    btnConsulta.show();
});

$("#btnJornada").click(function(){
    var resultHora = calcularHora();
    divSalida.html('<br>' + resultHora + '<br><br>');
});

function calcularHora() {
    //var estadisticas = $('.Estadisticas'),
    //var table = document.getElementsByTagName('table'),
        var table = $('.tile');
        rows = table[0].getElementsByTagName('tr'),
        horaAproxSalida = '',
        txtHoraJornada = $("#horaJornada"),
        txtMinutoJornada = $("#minutoJornada"),
        horaJoranada = 8,
        minutoJornada = 18,
        horaSalida = 0,
        minutoSalida = 0;


    if (txtHoraJornada.val() <= 14 && txtMinutoJornada.val() <= 59) {
        horaJornada = parseInt(txtHoraJornada.val());
        minutoJornada = parseInt(txtMinutoJornada.val());
    }

    if (rows.length > 1) {
        for (i = 2; i < rows.length; i++) { // arranca desde la tercer fila!
            var currentRow = table[0].rows[i];
            //controla si no es la fila de la fecha o la de tiempo trabajado
            if (currentRow.getElementsByTagName('td')[1] != undefined &&
                currentRow.getElementsByTagName('td')[1].innerHTML != "") {
                var horaEntradaFich = (currentRow.getElementsByTagName('td')[1].innerHTML).split(":");
                var horaSalidaFich = (currentRow.getElementsByTagName('td')[2].innerHTML).split(":");
                var tiempoTrabajado = (currentRow.getElementsByTagName('td')[3].innerHTML).split(":");
                if (tiempoTrabajado[0] == '-') {
                    horaSalida = parseInt(horaEntradaFich[0]) + horaJornada;
                    minutoSalida = parseInt(horaEntradaFich[1]) + minutoJornada;
                    if (minutoSalida >= 60) {
                        horaSalida++;
                        minutoSalida = minutoSalida - 60;
                    }
                } else {
                    horaSalida = horaSalida - parseInt(tiempoTrabajado[0]);
                    minutoSalida = minutoSalida - parseInt(tiempoTrabajado[1]);
                    if (minutoSalida < 0) {
                        horaSalida--;
                        minutoSalida = 60 - Math.abs(minutoSalida);
                    }
                }
            } else {
                break;
            }
        }
    }


    if (horaSalida <= 0) {
        horaAproxSalida = 'Fichar entrada';
    } else {
        esEntrada = false;
        var divisor = ':';
        if (minutoSalida < 10) {
            divisor = divisor + '0';
        }
        horaAproxSalida = horaSalida.toString() + divisor + minutoSalida.toString();
    }
    var html = "<legend id='horaAproxSalida'>Hora de salida</legend>" +
                "<div><h3><strong>" + horaAproxSalida + '</strong></h3></div>';
    //estadisticas.append(html);
    return(html);
}

$("#btnSetAlarm").click(function(){
    var now = new Date(),
        minutes = parseInt(txtMinutoAlarma.val());

    if (minutes > 0) {
        localStorage.minuteToAlarm = minutes;
        now.setMinutes(now.getMinutes() + minutes);

        cordova.plugins.notification.local.add({
            id: 1,
            date: now,
            title: "Fichar",
            text: "Recordar fichar",
            repeatDaily: false
        });

        $('#modalTimePicker').modal('toggle');
        btnAlarma.hide();
    }
});

});