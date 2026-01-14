import { DashboardLayout } from "@/components/DashboardLayout";
import { MapView } from "@/components/Map";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useCallback, useState } from "react";

export default function Mapa() {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const onMapReady = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
    
    // Coordenadas aproximadas das regiões de atuação
    const locations = [
      { lat: -20.3155, lng: -40.3128, title: "Vitória (ES)", type: "hub" }, // ES
      { lat: -19.9167, lng: -43.9345, title: "Belo Horizonte (MG)", type: "hub" }, // MG
      { lat: -22.9068, lng: -43.1729, title: "Rio de Janeiro (RJ)", type: "hub" }, // RJ
      { lat: -12.9777, lng: -38.5016, title: "Salvador (BA)", type: "hub" }, // BA
      { lat: -16.7274, lng: -39.1147, title: "Sul da Bahia", type: "rota" }, // Sul BA
    ];

    locations.forEach(loc => {
      new google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map: map,
        title: loc.title,
        icon: loc.type === "hub" 
          ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png" 
          : "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
      });
    });

    // Ajustar zoom para mostrar todos os pontos
    const bounds = new google.maps.LatLngBounds();
    locations.forEach(loc => bounds.extend({ lat: loc.lat, lng: loc.lng }));
    map.fitBounds(bounds);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 h-[calc(100vh-140px)] flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Cobertura Geográfica</h1>
            <p className="text-muted-foreground mt-1">Visualização das rotas e hubs de distribuição</p>
          </div>
        </div>

        <Card className="flex-1 border-none shadow-md overflow-hidden flex flex-col">
          <CardHeader className="bg-secondary/30 shrink-0">
            <div className="flex items-center gap-4">
              <CardTitle className="font-serif flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Mapa de Operações
              </CardTitle>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <span>Hubs Principais</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  <span>Rotas Ativas</span>
                </div>
              </div>
            </div>
            <CardDescription>Sudeste, Sul e Sul da Bahia</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative min-h-[400px]">
            <MapView 
              className="w-full h-full absolute inset-0"
              onMapReady={onMapReady}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
