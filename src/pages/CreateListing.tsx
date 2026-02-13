import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CATEGORIES, SUBCATEGORIES, ISLANDS, VEHICLE_BRANDS, VEHICLE_YEARS, MILEAGE_RANGES, ROOM_COUNTS } from '@/types/listing';
import { useCreateAd } from '@/hooks/useAds';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, X, ImagePlus, Star, Zap, ArrowUp, Check } from 'lucide-react';
import { BoostType, BOOST_PRICES } from '@/hooks/useBoost';

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
  const [selectedBoost, setSelectedBoost] = useState<BoostType | null>(null);

  // Vehicle specific
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vehicleMileage, setVehicleMileage] = useState('');

  // Real estate specific
  const [roomCount, setRoomCount] = useState('');

  const boostOptions = [
    {
      type: 'vedette' as BoostType,
      icon: Star,
      borderClass: 'border-amber-400',
      bgClass: 'bg-amber-50',
      iconClass: 'text-amber-500',
      selectedBg: 'bg-amber-100',
    },
    {
      type: 'urgent' as BoostType,
      icon: Zap,
      borderClass: 'border-red-400',
      bgClass: 'bg-red-50',
      iconClass: 'text-red-500',
      selectedBg: 'bg-red-100',
    },
    {
      type: 'remontee' as BoostType,
      icon: ArrowUp,
      borderClass: 'border-blue-400',
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-500',
      selectedBg: 'bg-blue-100',
    },
  ];

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

    if (title.length < 3) {
      toast({ title: "Titre trop court", description: "Le titre doit contenir au moins 3 caractères.", variant: "destructive" });
      return;
    }

    if (description.length < 20) {
      toast({ title: "Description trop courte", description: "La description doit contenir au moins 20 caractères.", variant: "destructive" });
      return;
    }

    try {
      const newAd = await createAd.mutateAsync({
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

      // Si un boost est sélectionné, rediriger vers le paiement
      if (selectedBoost && newAd?.id) {
        const { data, error } = await supabase.functions.invoke('create-boost-payment', {
          body: { adId: newAd.id, boostType: selectedBoost },
        });

        if (error || data?.error) {
          toast({
            title: "Annonce créée !",
            description: "Votre annonce est en attente de validation. Le boost sera disponible après validation.",
          });
          navigate('/mes-annonces');
          return;
        }

        if (data?.url) {
          toast({
            title: "Annonce créée !",
            description: "Redirection vers le paiement du boost...",
          });
          window.open(data.url, '_blank');
          navigate('/mes-annonces');
          return;
        }
      }

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
                  minLength={3}
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
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Saisir ou choisir une ville"
                    disabled={!island}
                    list="city-suggestions"
                  />
                  <datalist id="city-suggestions">
                    {selectedIslandData?.cities.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
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

              {/* Boost Options */}
              <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Boostez votre annonce
                  </CardTitle>
                  <CardDescription>
                    Optionnel : augmentez la visibilité de votre annonce dès sa publication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {boostOptions.map((option) => {
                    const Icon = option.icon;
                    const info = BOOST_PRICES[option.type];
                    const isSelected = selectedBoost === option.type;
                    
                    return (
                      <div
                        key={option.type}
                        onClick={() => setSelectedBoost(isSelected ? null : option.type)}
                        className={`
                          relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${isSelected 
                            ? `${option.borderClass} ${option.selectedBg} ring-2 ring-offset-2 ring-${option.type === 'vedette' ? 'amber' : option.type === 'urgent' ? 'red' : 'blue'}-400`
                            : `border-border hover:${option.borderClass} ${option.bgClass}`
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${option.bgClass}`}>
                            <Icon className={`h-5 w-5 ${option.iconClass}`} />
                          </div>
                          <div>
                            <p className="font-semibold">{info.label}</p>
                            <p className="text-sm text-muted-foreground">{info.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">{info.price}€</p>
                            <p className="text-xs text-muted-foreground">7 jours</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2">
                              <Check className={`h-5 w-5 ${option.iconClass}`} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {selectedBoost && (
                    <p className="text-sm text-center text-muted-foreground pt-2">
                      💳 Vous serez redirigé vers le paiement après la création de l'annonce
                    </p>
                  )}
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" size="lg" disabled={createAd.isPending || !category || !island}>
                {createAd.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Création...
                  </>
                ) : selectedBoost ? (
                  `Déposer et payer le boost (${BOOST_PRICES[selectedBoost].price}€)`
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
