import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CATEGORIES, SUBCATEGORIES, ISLANDS, VEHICLE_BRANDS, VEHICLE_YEARS, MILEAGE_RANGES, ROOM_COUNTS } from '@/types/listing';
import { useCreateAd } from '@/hooks/useAds';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, X, ImagePlus } from 'lucide-react';

export default function CreateListing() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const createAd = useCreateAd();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [island, setIsland] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Vehicle specific
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleMileage, setVehicleMileage] = useState('');

  // Real estate specific
  const [roomCount, setRoomCount] = useState('');

  const selectedIslandData = ISLANDS.find(i => i.value === island);
  const subcategories = category ? SUBCATEGORIES[category] || [] : [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('ad-images')
        .upload(filePath, file);

      if (error) {
        toast({
          title: "Erreur d'upload",
          description: error.message,
          variant: "destructive",
        });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('ad-images')
        .getPublicUrl(filePath);

      newImages.push(publicUrl);
    }

    setImages(prev => [...prev, ...newImages]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour déposer une annonce.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    if (title.length < 4) {
      toast({ title: "Titre trop court", description: "Le titre doit contenir au moins 4 caractères.", variant: "destructive" });
      return;
    }

    if (description.length < 20) {
      toast({ title: "Description trop courte", description: "La description doit contenir au moins 20 caractères.", variant: "destructive" });
      return;
    }

    try {
      await createAd.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        price: parseInt(price) || 0,
        category,
        subcategory: subcategory || undefined,
        island,
        city: city || undefined,
        images: images.length > 0 ? images : ['/placeholder.svg'],
        phone_number: phone || undefined,
        vehicle_brand: vehicleBrand || undefined,
        vehicle_year: vehicleYear || undefined,
        vehicle_mileage: vehicleMileage || undefined,
        room_count: roomCount || undefined,
      });

      toast({
        title: "Annonce créée !",
        description: "Votre annonce est en attente de validation.",
      });
      navigate('/mes-annonces');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Déposer une annonce</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: iPhone 14 Pro Max 256Go"
                  required
                  minLength={4}
                />
              </div>

              {/* Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Catégorie *</Label>
                  <Select value={category} onValueChange={(v) => { setCategory(v); setSubcategory(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.slug} value={cat.slug}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {subcategories.length > 0 && (
                  <div>
                    <Label>Sous-catégorie</Label>
                    <Select value={subcategory} onValueChange={setSubcategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Vehicle specific fields */}
              {category === 'vehicules' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Marque</Label>
                    <Select value={vehicleBrand} onValueChange={setVehicleBrand}>
                      <SelectTrigger><SelectValue placeholder="Marque" /></SelectTrigger>
                      <SelectContent>
                        {VEHICLE_BRANDS.map((brand) => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Année</Label>
                    <Select value={vehicleYear} onValueChange={setVehicleYear}>
                      <SelectTrigger><SelectValue placeholder="Année" /></SelectTrigger>
                      <SelectContent>
                        {VEHICLE_YEARS.map((year) => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Kilométrage</Label>
                    <Select value={vehicleMileage} onValueChange={setVehicleMileage}>
                      <SelectTrigger><SelectValue placeholder="Kilométrage" /></SelectTrigger>
                      <SelectContent>
                        {MILEAGE_RANGES.map((range) => (
                          <SelectItem key={range} value={range}>{range}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Real estate specific fields */}
              {category === 'immobilier' && (
                <div>
                  <Label>Nombre de pièces</Label>
                  <Select value={roomCount} onValueChange={setRoomCount}>
                    <SelectTrigger><SelectValue placeholder="Pièces" /></SelectTrigger>
                    <SelectContent>
                      {ROOM_COUNTS.map((count) => (
                        <SelectItem key={count} value={count}>{count} pièce{count !== '1' ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Price */}
              <div>
                <Label htmlFor="price">Prix (KMF)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0 pour gratuit"
                  min="0"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Île *</Label>
                  <Select value={island} onValueChange={(v) => { setIsland(v); setCity(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ISLANDS.map((i) => (
                        <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Ville</Label>
                  <Select value={city} onValueChange={setCity} disabled={!island}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner ou saisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedIslandData?.cities.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre article en détail..."
                  rows={5}
                  required
                  minLength={20}
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">Téléphone de contact</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+269..."
                />
              </div>

              {/* Images */}
              <div>
                <Label>Photos</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors">
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <ImagePlus className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1">Ajouter</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={createAd.isPending || !category || !island}>
                {createAd.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Création...
                  </>
                ) : (
                  'Déposer mon annonce'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
