function calcularRoteirizacao() {
  if (!$("#ativosRoteirizar").val()) {
    sweetAlert({
      title: "Ops!",
      text: "Você deve selecionar o(s) ativo(s)!",
      type: "warning"
    });
    return false;
  }
  if (!$("#ordensRoteirizar").val()) {
    sweetAlert({
      title: "Ops!",
      text: "Você deve selecionar a(s) ordem(s)!",
      type: "warning"
    });
    return false;
  }
  
  var veiculos = [];
  
  var ativos_roteirizar_description = $("#ativosRoteirizar").val().split(", ");
  
  $('input[name="ativo_roteirizar[]"]').each(function () {
    var ativo_roteirizar = JSON.parse($(this).val().replace(/\\"/g, '"'));
    
    if (ativos_roteirizar_description.includes(ativo_roteirizar.description)) {
      veiculos.push(ativo_roteirizar);
    }
  });
  
  var ordens = [];
  
  var ordens_roteirizar_numero = $("#ordensRoteirizar").val().split(", ");
  
  $('input[name="ordem_roteirizar[]"]').each(function () {
    var ordem_roteirizar = JSON.parse($(this).val().replace(/\\"/g, '"'));
    
    if (ordens_roteirizar_numero.includes(ordem_roteirizar.ordem.toString())) {
      if ($("#cargaDescargaRoteirizarOrdens").val()!='driversat') {
        ordem_roteirizar.duration = $("#cargaDescargaRoteirizarOrdens").val();
      }
      ordens.push(ordem_roteirizar);
    }
  });
  
  $("#tbodyresultadoroteirizar").html('');
  $("#tbodytotaisroteirizar").html('');
  
  $.ajax({
    url: $("#url").val() + "ordem/roteirizar_ordens",
    type: 'POST',
    data: { 
      ordens: ordens,
      veiculos: veiculos,
      dividir: $("#dividirRoteirizarOrdens").val().toString() == 'true' ? 'sim' : 'nao',
      data: $("#dataOrdensRoteirizar").val().toString(),
    },
    success: function (result) {
      var retorno = JSON.parse(result);
      
      if (retorno.error) {       
        ordens_roteirizadas = [];
        nao_foi_possivel_roteirizar = []; 
        sweetAlert("Erro!", retorno.error, "error");
      } else {        
        ordens_roteirizadas = [];
        retorno?.response?.workDays[0]?.plans?.forEach((plan) => {
          plan.route.sequence.forEach((sequence) => {
            if(sequence.type == 'job') {
              ordens_roteirizadas.push({id_ordem: sequence.id, id_veiculo: plan.vehicle});
            }
          })
        })
        console.log('ordens_roteirizadas após popular:', ordens_roteirizadas);
        nao_foi_possivel_roteirizar = retorno?.response?.unassignedTasks || [];
        $("#modal-mapa-roteirizar")
          .modal({
            backdrop: "static",
            keyboard: false
          })
          .on("shown.bs.modal", function() {
            console.log(retorno);
            
            if (typeof map_roteirizar !== "undefined") {
              map_roteirizar.invalidateSize();
              map_roteirizar.panTo(new L.LatLng($("#Loginlatitude").val(), $("#Loginlongitude").val()));
            } else {
              map_roteirizar = L.map("mapa-roteirizar", { attributionControl: false }).setView(
                [$("#Loginlatitude").val(), $("#Loginlongitude").val()],
                18
              );

              L.tileLayer.provider("GoogleStreets").addTo(map_roteirizar);
            }
            
            if (typeof markerClusterRoteirizar !== "undefined") {
              markerClusterRoteirizar.clearLayers();
            }
            
            var bounds = new L.latLngBounds();
            markerClusterRoteirizar = L.markerClusterGroup({
              maxClusterRadius: 20
            });
            
            bounds.extend(L.LatLng($("#Loginlatitude").val(), $("#Loginlongitude").val()));
            
            var CustomMarkerIcon = L.Icon.extend({
              options: {
                customId: "",
                placa: "",
                ignicao: "",
                velocidade: "",
                endereco: "",
                nome: "",
                lat: "",
                lng: "",
                datahora: "",
                referencia: "-"
              }
            });
            
            for (var i = 0; i < markers_roteirizar.length; i++) {
              map_roteirizar.removeLayer(markers_roteirizar[i]);
            }
            while(markers_roteirizar.length > 0) {
              markers_roteirizar.pop();
            }
            
            for (var i = 0; i < polyline_rotas_roteirizar.length; i++) {
              map_roteirizar.removeLayer(polyline_rotas_roteirizar[i]);
            }
            while(polyline_rotas_roteirizar.length > 0) {
              polyline_rotas_roteirizar.pop();
            }
            
            var ordem_rota = "";
            var placa_rota = "";
            
            retorno.response.workDays.forEach(day => {
              day.plans.forEach((plan, index) => {
                var index_sequencia_veiculo = 1;
                var veiculo = veiculos.filter(v => parseInt(v.id, 10) === plan.vehicle)[0];
                var meters = plan.summary.distance.meters;
                var duration = plan.summary.time.duration + plan.summary.time.traveling;
                
                placa_rota += "<tr>";
                placa_rota += "<td><small style='color:black'>" + veiculo.description + "</small></td>";
                placa_rota += "<td><small style='color:black'>~ " + (meters / 1000).toFixed(3) + " Km</small></td>";
                placa_rota += "<td><small style='color:black'>~ " + secondsToHMS(duration) + "</small></td>";
                placa_rota += "</tr>";
                
                bounds.extend(L.latLng(veiculo.location_start_latitude, veiculo.location_start_longitude));
                
                bounds.extend(L.latLng(veiculo.location_end_latitude, veiculo.location_end_longitude));
                  
                var marker_ativo_start = L.marker(L.latLng(veiculo.location_start_latitude, veiculo.location_start_longitude), {
                  icon: new CustomMarkerIcon({
                    iconUrl: $("#url").val() + "assets/imagens/marker_start_route.png",
                    iconAnchor: [9, 24]
                  }),
                  lat: veiculo.location_start_latitude,
                  lng: veiculo.location_start_longitude
                })
                  .bindTooltip(veiculo.description, {
                    permanent: true,
                    direction: "bottom",
                    className: "LlabelsMarkersNewMapa",
                  });
                  
                var marker_ativo_end = L.marker(L.latLng(veiculo.location_end_latitude, veiculo.location_end_longitude), {
                  icon: new CustomMarkerIcon({
                    iconUrl: $("#url").val() + "assets/imagens/marker_finish_route.png",
                    iconAnchor: [9, 24]
                  }),
                  lat: veiculo.location_end_latitude,
                  lng: veiculo.location_end_longitude
                })
                  .bindTooltip(veiculo.description, {
                    permanent: true,
                    direction: "bottom",
                    className: "LlabelsMarkersNewMapa",
                  });
                
                markerClusterRoteirizar.addLayer(marker_ativo_start);
                markerClusterRoteirizar.addLayer(marker_ativo_end);
                
                markers_roteirizar.push(marker_ativo_start);
                markers_roteirizar.push(marker_ativo_end);
                
                var encoded_polyline = plan.route.polyline;
                console.log(L.Polyline.fromEncoded(encoded_polyline));
                var coordinates_polyline = L.Polyline.fromEncoded(encoded_polyline).getLatLngs();
                
                var color_vehicle = generateRandomHSL(day.plans.length, index);
                
                var polyline_route = L.polyline(
                    coordinates_polyline,
                    {
                        color: color_vehicle,
                        weight: 3,
                        opacity: .7,
                        lineJoin: 'round'
                    }
                ).addTo(map_roteirizar);
                
                polyline_rotas_roteirizar.push(polyline_route);
                  
                plan.route.sequence.forEach((seq, index) => {
                  if (seq.type === "job") {
                    bounds.extend(L.latLng(seq.location.latitude, seq.location.longitude));
                    
                    var ordem = ordens.filter(o => parseInt(o.id, 10) === seq.id)[0];
                    
                    var marker = L.marker(L.latLng(seq.location.latitude, seq.location.longitude), { 
                      icon: 
                        L.divIcon({
                          className: 'custom-marker-recorrencia',
                          html: `
                              <div>${index_sequencia_veiculo}</div>
                              <div class="custom-label-recorrencia">${ordem.ordem.toString()} - ${veiculo.description}</div>
                          `,
                          iconSize: [30, 30], // Ajusta o tamanho para acomodar a label
                          iconAnchor: [15, 30]
                        })
                    });
                      /*.bindTooltip(ordem.ordem.toString()+" - "+veiculo.description, {
                        permanent: true,
                        direction: "bottom",
                        className: "LlabelsMarkersNewMapa",
                      });*/
                    
                    markerClusterRoteirizar.addLayer(marker);
                    
                    markers_roteirizar.push(marker);
                    
                    ordem_rota += "<tr>";
                    ordem_rota += "<td><small style='color:black'>" + index_sequencia_veiculo + "</small></td>";
                    ordem_rota += "<td><small style='color:black'>" + ordem.ordem + " - " +ordem.tipo_ordem + "</small></td>";
                    ordem_rota += "<td><small style='color:"+color_vehicle+";font-weight:900'>" + veiculo.description + "</small></td>";
                    ordem_rota += "<td><small style='color:black'>" + $("#dataOrdensRoteirizar").val().split("-").reverse().join("/") + "</small></td>";
                    ordem_rota += "<td><small style='color:black'>~" + new Date(plan.route.sequence[index-1].time.departure*1000).toLocaleTimeString() + "</small></td>";
                    ordem_rota += "<td><small style='color:black'>~" + new Date(seq.time.arrival*1000).toLocaleTimeString() + "</small></td>";
                    ordem_rota += "<td><small style='color:black'>~" + secondsToHMS(seq.time.traveling - (index > 0 && plan.route.sequence[index-1].type === "job" ? plan.route.sequence[index-1].time.traveling : 0)) + "</small></td>";
                    ordem_rota += "<td><small style='color:black'>~" + secondsToHMS(seq.time.complete - seq.time.arrival) + "</small></td>";
                    ordem_rota += "<td><small style='color:black'>~" + ((seq.distance.meters - (index > 0 && plan.route.sequence[index-1].type === "job" ? plan.route.sequence[index-1].distance.meters : 0)) / 1000).toFixed(3) + " Km</small></td>";
                    ordem_rota += "<td><small style='color:black'>" + ordem.referencia + "</small></td>";
                    ordem_rota += "</tr>";
                    
                    index_sequencia_veiculo = index_sequencia_veiculo + 1;
                  }
                  if (seq.type === "end") {
                    ordem_rota += "<tr>";
                    ordem_rota += "<td><small style='color:black'>-</small></td>";
                    ordem_rota += "<td><small style='color:black'>-</small></td>";
                    ordem_rota += "<td><small style='color:"+color_vehicle+";font-weight:900'>" + veiculo.description + "</small></td>";
                    ordem_rota += "<td><small style='color:black'>" + $("#dataOrdensRoteirizar").val().split("-").reverse().join("/") + "</small></td>";
                    ordem_rota += "<td><small style='color:black'>~" + new Date(plan.route.sequence[index-1].time.departure*1000).toLocaleTimeString() + "</small></td>";
                    ordem_rota += "<td><small style='color:black'>~" + new Date(seq.time.arrival*1000).toLocaleTimeString() + "</small></td>";
                    ordem_rota += "<td><small style='color:black'>~" + secondsToHMS(seq.time.traveling - plan.route.sequence[index-1].time.traveling) + "</small></td>";
                    ordem_rota += "<td><small style='color:black'>-</small></td>";
                    ordem_rota += "<td><small style='color:black'>~" + ((seq.distance.meters - (index > 0 && plan.route.sequence[index-1].type === "job" ? plan.route.sequence[index-1].distance.meters : 0)) / 1000).toFixed(3) + " Km</small></td>";
                    ordem_rota += "<td><small style='color:black'>FINAL DA ROTA</small></td>";
                    ordem_rota += "</tr>";
                  }
                });
              });
            });
            
            retorno.response.unassignedTasks.forEach(task => {
              var ordem = ordens.filter(o => parseInt(o.id, 10) === task)[0];
              
              ordem_rota += "<tr style='background-color:#ed632e'>";
              ordem_rota += "<td><small style='color:black'>-</small></td>";
              ordem_rota += "<td><small style='color:black'>" + ordem.ordem + " - " +ordem.tipo_ordem + "</small></td>";
              ordem_rota += "<td><small style='color:black'>-</small></td>";
              ordem_rota += "<td><small style='color:black'>-</small></td>";
              ordem_rota += "<td><small style='color:black'>-</small></td>";
              ordem_rota += "<td><small style='color:black'>NÃO FOI POSSÍVEL ROTEIRIZAR</small></td>";
              ordem_rota += "<td><small style='color:black'>-</small></td>";
              ordem_rota += "<td><small style='color:black'>-</small></td>";
              ordem_rota += "<td><small style='color:black'>-</small></td>";
              ordem_rota += "<td><small style='color:black'>" + ordem.referencia + "</small></td>";
              ordem_rota += "</tr>";
            });
            
            $("#tbodyresultadoroteirizar").html(ordem_rota);
            placa_rota += "<tr>";
            placa_rota += "<td><small style='color:black'>TOTAL</small></td>";
            placa_rota += "<td><small style='color:black'>~ " + (retorno.response.summary.distance.meters / 1000).toFixed(3) + " Km</small></td>";
            placa_rota += "<td><small style='color:black'>~ " + secondsToHMS(retorno.response.summary.time.duration + retorno.response.summary.time.traveling) + "</small></td>";
            placa_rota += "</tr>";
            $("#tbodytotaisroteirizar").html(placa_rota);
            
            map_roteirizar.addLayer(markerClusterRoteirizar);
            
            if (markers_roteirizar.length > 0) {
              map_roteirizar.fitBounds(bounds);B
            }
            
            $('#btnSalvarRoteirizacao').off('click');
            $('#btnSalvarRoteirizacao').on('click', function() {
              $("#modal-mapa-roteirizar").modal('hide');
              setTimeout(function() { salvarRoteirizacao(retorno.response, $("#dataOrdensRoteirizar").val().toString()); }, 350);
            });
          });
      }
    },
    beforeSend: function () {
      $("#Modal_loading").modal("show");
    },
    complete: function() {
      setTimeout(function() { $("#Modal_loading").modal("hide"); }, 350);
    },
    error: function(xhr, status, error) {
      sweetAlert("Erro!", "("+xhr.status+ "/" +xhr.statusText+") - Erro inesperado contate o suporte!", "error");
    }
  });
}