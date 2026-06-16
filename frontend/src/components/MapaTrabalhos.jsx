import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { catIcone } from '../lib/constants';

// Mapa dinâmico (Leaflet + OpenStreetMap): você no centro, trabalhos como pins.
// Tocar num pin abre o cartãozinho com botão "Tenho interesse".
export function MapaTrabalhos({ trabalhos, pos, raioKm, onInteresse }) {
  const divRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  // Cria o mapa uma vez
  useEffect(() => {
    if (mapRef.current || !divRef.current) return;
    const center = pos
      ? [pos.lat, pos.lng]
      : trabalhos.find((t) => t.lat != null)
        ? [trabalhos.find((t) => t.lat != null).lat, trabalhos.find((t) => t.lat != null).lng]
        : [-23.5505, -46.6333]; // São Paulo

    const map = L.map(divRef.current, { zoomControl: false, attributionControl: true }).setView(center, 13);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    // Tiles escuros (Carto) combinam com o app; grátis com atribuição
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);

    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  // Atualiza pins, círculo do raio e enquadramento
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    const bounds = [];

    if (pos) {
      L.marker([pos.lat, pos.lng], {
        icon: L.divIcon({ className: '', html: '<div class="user-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
        interactive: false,
      }).addTo(layer);
      bounds.push([pos.lat, pos.lng]);

      if (raioKm) {
        L.circle([pos.lat, pos.lng], {
          radius: raioKm * 1000,
          color: '#60A5FA',
          weight: 1.5,
          fillColor: '#60A5FA',
          fillOpacity: 0.07,
        }).addTo(layer);
      }
    }

    trabalhos.filter((t) => t.lat != null && t.lng != null).forEach((t) => {
      const marker = L.marker([t.lat, t.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div class="pin-cat">${catIcone(t.categoria)}</div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }),
      }).addTo(layer);
      bounds.push([t.lat, t.lng]);

      // Popup montado na mão para poder ligar o clique do botão
      const el = document.createElement('div');
      el.className = 'pin-popup';
      el.innerHTML = `
        <div class="pp-foto" style="background-image:url('${(t.fotos[0] || '').replace(/'/g, '')}')"></div>
        <div class="pp-titulo">${t.titulo}</div>
        <div class="pp-meta">📍 ${t.bairro}${t.distanciaKm != null ? ` · a ${String(t.distanciaKm).replace('.', ',')} km de você` : ''}</div>
        <button class="pp-btn">🤝 Tenho interesse</button>
      `;
      el.querySelector('.pp-btn').addEventListener('click', () => {
        map.closePopup();
        onInteresse(t);
      });
      marker.bindPopup(el, { closeButton: true, maxWidth: 240 });
    });

    if (bounds.length > 1) map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    else if (bounds.length === 1) map.setView(bounds[0], 14);
  }, [trabalhos, pos, raioKm, onInteresse]);

  return <div ref={divRef} className="absolute inset-0 rounded-3xl overflow-hidden border border-border z-0" />;
}
