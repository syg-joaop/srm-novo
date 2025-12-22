/**
 * Decodifica uma polyline encoded no formato Google Polyline Algorithm.
 * Referência: https://developers.google.com/maps/documentation/utilities/polylinealgorithm
 *
 * @param encoded - String da polyline encoded
 * @returns Array de coordenadas [latitude, longitude]
 */
export function decodePolyline(encoded: string, precision?: 5 | 6): [number, number][] {
  const coordinates: [number, number][] = [];

  const cleaned = (encoded ?? "").replace(/\s+/g, "");

  if (!cleaned || cleaned.length === 0) {
    return coordinates;
  }

  let index = 0;
  let lat = 0;
  let lng = 0;
  const resolvedPrecision = precision ?? 5;
  const factor = Math.pow(10, resolvedPrecision);

  while (index < cleaned.length) {
    // Decodifica latitude
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = cleaned.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    // Decodifica longitude
    shift = 0;
    result = 0;

    do {
      byte = cleaned.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    // Converte de inteiro para coordenada decimal (precisão de 5 casas)
    coordinates.push([lat / factor, lng / factor]);
  }

  if (precision === undefined) {
    const hasOutOfRange = coordinates.some(([cLat, cLng]) => Math.abs(cLat) > 90 || Math.abs(cLng) > 180);
    if (hasOutOfRange) {
      return decodePolyline(cleaned, 6);
    }
  }

  return coordinates;
}

/**
 * Codifica um array de coordenadas no formato Google Polyline Algorithm.
 *
 * @param coordinates - Array de coordenadas [latitude, longitude]
 * @returns String da polyline encoded
 */
export function encodePolyline(coordinates: [number, number][]): string {
  if (!coordinates || coordinates.length === 0) {
    return "";
  }

  let encoded = "";
  let prevLat = 0;
  let prevLng = 0;

  for (const [lat, lng] of coordinates) {
    // Converte para inteiro (precisão de 5 casas)
    const latInt = Math.round(lat * 1e5);
    const lngInt = Math.round(lng * 1e5);

    // Calcula delta
    const deltaLat = latInt - prevLat;
    const deltaLng = lngInt - prevLng;

    prevLat = latInt;
    prevLng = lngInt;

    // Codifica delta
    encoded += encodeNumber(deltaLat);
    encoded += encodeNumber(deltaLng);
  }

  return encoded;
}

/**
 * Codifica um número no formato polyline
 */
function encodeNumber(num: number): string {
  let encoded = "";

  // Left-shift e inverte se negativo
  let value = num < 0 ? ~(num << 1) : num << 1;

  while (value >= 0x20) {
    encoded += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
    value >>= 5;
  }

  encoded += String.fromCharCode(value + 63);
  return encoded;
}

/**
 * Calcula a distância total de uma polyline em metros usando a fórmula de Haversine.
 *
 * @param coordinates - Array de coordenadas [latitude, longitude]
 * @returns Distância total em metros
 */
export function calculatePolylineDistance(coordinates: [number, number][]): number {
  if (coordinates.length < 2) return 0;

  let totalDistance = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += haversineDistance(coordinates[i], coordinates[i + 1]);
  }

  return totalDistance;
}

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine.
 *
 * @param point1 - Coordenada [latitude, longitude]
 * @param point2 - Coordenada [latitude, longitude]
 * @returns Distância em metros
 */
function haversineDistance(point1: [number, number], point2: [number, number]): number {
  const R = 6371000; // Raio da Terra em metros
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Simplifica uma polyline removendo pontos desnecessários.
 * Usa o algoritmo de Douglas-Peucker.
 *
 * @param coordinates - Array de coordenadas [latitude, longitude]
 * @param tolerance - Tolerância em graus (padrão: 0.00001 ~= 1m)
 * @returns Array de coordenadas simplificado
 */
export function simplifyPolyline(
  coordinates: [number, number][],
  tolerance: number = 0.00001,
): [number, number][] {
  if (coordinates.length < 3) return coordinates;

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  let maxDistance = 0;
  let maxIndex = 0;

  for (let i = 1; i < coordinates.length - 1; i++) {
    const distance = perpendicularDistance(coordinates[i], first, last);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  if (maxDistance > tolerance) {
    const left = simplifyPolyline(coordinates.slice(0, maxIndex + 1), tolerance);
    const right = simplifyPolyline(coordinates.slice(maxIndex), tolerance);
    return [...left.slice(0, -1), ...right];
  }

  return [first, last];
}

function perpendicularDistance(
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number],
): number {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  }

  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy);
  const tClamped = Math.max(0, Math.min(1, t));

  const nearestX = x1 + tClamped * dx;
  const nearestY = y1 + tClamped * dy;

  return Math.sqrt((x - nearestX) ** 2 + (y - nearestY) ** 2);
}
