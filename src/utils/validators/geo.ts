export function isValidCoordinate(lat: number | string, lng: number | string): boolean {
  const latNum = typeof lat === "string" ? parseFloat(lat) : lat;
  const lngNum = typeof lng === "string" ? parseFloat(lng) : lng;

  return (
    !isNaN(latNum) &&
    !isNaN(lngNum) &&
    latNum !== 0 &&
    lngNum !== 0 &&
    latNum >= -90 &&
    latNum <= 90 &&
    lngNum >= -180 &&
    lngNum <= 180
  );
}
