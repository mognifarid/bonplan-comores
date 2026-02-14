import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, SUBCATEGORIES, ISLANDS, VEHICLE_BRANDS, VEHICLE_YEARS, MILEAGE_RANGES, ROOM_COUNTS } from '@/types/listing';
import { useCreateAd } from '@/hooks/useAds';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, X, ImagePlus, Star, Zap, ArrowUp, Check, MapPin, Tag, FileText, Phone, Camera } from 'lucide-react';
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
      selectedBg: 'bg-amber-100'
    },
    {
      type: 'urgent' as BoostType,
      icon: Zap,
      borderClass: 'border-red-400',
      bgClass: 'bg-red-50',
      iconClass: 'text-red-500',
      selectedBg: 'bg-red-100'
    },
    {
      type: 'remontee' as BoostType,
      icon: ArrowUp,
      borderClass: 'border-blue-400',
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-500',
      selectedBg: 'bg-blue-100'
    }
  ];

  const selectedIslandData = ISLANDS.find((i) => i.value === island);
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

      const { error } = await supabase.storage.from('ad-images').upload(filePath, file);

      if (error) {
        toast({ title: "Erreur d'upload", description: error.message, variant: "destructive" });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage.from('ad-images').getPublicUrl(filePath);
      newImages.push(publicUrl);
    }

    setImages((prev) => [...prev, ...newImages]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour déposer une annonce.", variant: "destructive" });
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
        room_count: roomCount || undefined
      });

      if (selectedBoost && newAd?.id) {
        const { data, error } = await supabase.functions.invoke('create-boost-payment', {
          body: { adId: newAd.id, boostType: selectedBoost }
        });

        if (error || data?.error) {
          toast({ title: "Annonce créée !", description: "Votre annonce est en attente de validation. Le boost sera disponible après validation." });
          navigate('/mes-annonces');
          return;
        }

        if (data?.url) {
          toast({ title: "Annonce créée !", description: "Redirection vers le paiement du boost..." });
          window.open(data.url, '_blank');
          navigate('/mes-annonces');
          return;
        }
      }

      toast({ title: "Annonce créée !", description: "Votre annonce est en attente de validation." });
      navigate('/mes-annonces');
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message || "Une erreur est survenue.", variant: "destructive" });
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

      <main className="flex-1 container py-8 max-w-2xl animate-slide-up">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Déposer une annonce
          </h1>
          <p className="text-muted-foreground mt-2">
            Remplissez les informations ci-dessous pour publier votre annonce
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Informations principales */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
            <div className="flex items-center gap-2 text-primary mb-1">
              <FileText className="h-5 w-5" />
              <h2 className="font-semibold text-lg">Informations principales</h2>
            </div>

            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: iPhone 14 Pro Max 256Go"
                required
                minLength={3}
                className="mt-1.5"
              />
              {title.length > 0 && title.length < 3 && (
                <p className="text-sm text-destructive mt-1">Minimum 3 caractères ({title.length}/3)</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Catégorie *</Label>
                <Select value={category} onValueChange={(v) => { setCategory(v); setSubcategory(''); }}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.slug}>{cat.icon} {cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {subcategories.length > 0 && (
                <div>
                  <Label>Sous-catégorie</Label>
                  <Select value={subcategory} onValueChange={setSubcategory}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
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
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Marque" /></SelectTrigger>
                    <SelectContent>{VEHICLE_BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Année</Label>
                  <Select value={vehicleYear} onValueChange={setVehicleYear}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Année" /></SelectTrigger>
                    <SelectContent>{VEHICLE_YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Kilométrage</Label>
                  <Select value={vehicleMileage} onValueChange={setVehicleMileage}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Kilométrage" /></SelectTrigger>
                    <SelectContent>{MILEAGE_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Real estate specific fields */}
            {category === 'immobilier' && (
              <div>
                <Label>Nombre de pièces</Label>
                <Select value={roomCount} onValueChange={setRoomCount}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Pièces" /></SelectTrigger>
                  <SelectContent>{ROOM_COUNTS.map((c) => <SelectItem key={c} value={c}>{c} pièce{c !== '1' ? 's' : ''}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="price">Prix (KMF)</Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0 pour gratuit"
                min="0"
                className="mt-1.5"
              />
            </div>
          </section>

          {/* Section: Localisation */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
            <div className="flex items-center gap-2 text-primary mb-1">
              <MapPin className="h-5 w-5" />
              <h2 className="font-semibold text-lg">Localisation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Île *</Label>
                <Select value={island} onValueChange={(v) => { setIsland(v); setCity(''); }}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {ISLANDS.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
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
                  className="mt-1.5"
                />
                <datalist id="city-suggestions">
                  {selectedIslandData?.cities.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
            </div>
          </section>

          {/* Section: Description & Contact */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Tag className="h-5 w-5" />
              <h2 className="font-semibold text-lg">Description & Contact</h2>
            </div>

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
                className="mt-1.5"
              />
              {description.length > 0 && description.length < 20 && (
                <p className="text-sm text-destructive mt-1">Minimum 20 caractères ({description.length}/20)</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Téléphone de contact
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+269..."
                className="mt-1.5"
              />
            </div>
          </section>

          {/* Section: Photos */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Camera className="h-5 w-5" />
              <h2 className="font-semibold text-lg">Photos</h2>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-muted ring-1 ring-border group">
                  <img src={img} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <ImagePlus className="h-7 w-7 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1 font-medium">Ajouter</span>
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
          </section>

          {/* Section: Boost */}
          <section className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-5 w-5 text-amber-500" />
              <h2 className="font-semibold text-lg text-foreground">Boostez votre annonce</h2>
            </div>
            <p className="text-sm text-muted-foreground -mt-2">
              Optionnel : augmentez la visibilité de votre annonce dès sa publication
            </p>

            <div className="space-y-3">
              {boostOptions.map((option) => {
                const Icon = option.icon;
                const info = BOOST_PRICES[option.type];
                const isSelected = selectedBoost === option.type;

                return (
                  <div
                    key={option.type}
                    onClick={() => setSelectedBoost(isSelected ? null : option.type)}
                    className={`
                      relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${isSelected
                        ? `${option.borderClass} ${option.selectedBg} shadow-md`
                        : `border-border hover:${option.borderClass} ${option.bgClass}`}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${option.bgClass}`}>
                        <Icon className={`h-4 w-4 ${option.iconClass}`} />
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
            </div>
          </section>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            size="lg"
            disabled={createAd.isPending || !category || !island}
          >
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
      </main>

      <Footer />
    </div>
  );
}
