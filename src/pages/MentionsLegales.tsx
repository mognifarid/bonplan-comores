import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Shield, Scale, Server, Mail, AlertTriangle, Cookie, RefreshCw } from 'lucide-react';

const sections = [
  {
    icon: Shield,
    title: "Éditeur du site",
    content: [
      "Le site **Le Bon Plan Comores** est une plateforme de petites annonces en ligne destinée aux habitants de l'Union des Comores (Grande Comore, Anjouan, Mohéli).",
      "**Nom du site :** Le Bon Plan Comores",
      "**Email de contact :** bonplancomores@gmail.com",
      "**Directeur de la publication :** Le responsable du site Le Bon Plan Comores",
    ],
  },
  {
    icon: Server,
    title: "Hébergement",
    content: [
      "Le site est hébergé par **Lovable** (plateforme cloud).",
      "L'infrastructure backend et la base de données sont gérées via des services cloud sécurisés.",
    ],
  },
  {
    icon: Scale,
    title: "Conditions générales d'utilisation",
    content: [
      "L'utilisation du site **Le Bon Plan Comores** implique l'acceptation pleine et entière des conditions générales d'utilisation décrites ci-après.",
      "**Inscription :** L'accès à certaines fonctionnalités (dépôt d'annonces, messagerie, favoris) nécessite la création d'un compte utilisateur avec une adresse email valide.",
      "**Publication d'annonces :** Les utilisateurs sont seuls responsables du contenu de leurs annonces. Toute annonce illicite, frauduleuse ou contraire aux bonnes mœurs sera supprimée sans préavis.",
      "**Modération :** L'équipe se réserve le droit de modérer, modifier ou supprimer tout contenu jugé inapproprié, y compris les avis utilisateurs qui sont soumis à validation avant publication.",
      "**Boost d'annonces :** Les services de mise en avant (Vedette, Urgent, Remontée) sont des services payants soumis à des conditions tarifaires spécifiques.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Responsabilité",
    content: [
      "**Le Bon Plan Comores** agit en tant qu'intermédiaire entre vendeurs et acheteurs. Le site ne peut être tenu responsable :",
      "• Des transactions effectuées entre utilisateurs",
      "• De la qualité, la conformité ou la légalité des biens et services proposés",
      "• Des informations fournies par les annonceurs",
      "• Des éventuels litiges entre utilisateurs",
      "Les utilisateurs sont invités à faire preuve de vigilance lors de leurs transactions et à signaler tout contenu suspect via la fonctionnalité de signalement intégrée.",
    ],
  },
  {
    icon: Shield,
    title: "Protection des données personnelles",
    content: [
      "Conformément à la réglementation en vigueur, les utilisateurs disposent d'un droit d'accès, de rectification, de suppression et de portabilité de leurs données personnelles.",
      "**Données collectées :** nom, adresse email, numéro de téléphone (facultatif), photo de profil (facultatif), contenu des annonces publiées.",
      "**Finalité :** Les données sont collectées pour le bon fonctionnement de la plateforme : gestion des comptes, publication d'annonces, messagerie et modération.",
      "**Conservation :** Les données sont conservées tant que le compte utilisateur est actif. En cas de suppression du compte, les données sont effacées dans un délai raisonnable.",
      "**Sécurité :** Les données sont protégées par des mesures de sécurité techniques (chiffrement, politiques d'accès) pour prévenir tout accès non autorisé.",
      "Pour exercer vos droits, contactez-nous à : **bonplancomores@gmail.com**",
    ],
  },
  {
    icon: Cookie,
    title: "Cookies",
    content: [
      "Le site utilise des cookies techniques nécessaires au bon fonctionnement de la plateforme, notamment pour :",
      "• La gestion de votre session de connexion",
      "• La mémorisation de vos préférences",
      "• La sécurité de votre compte",
      "Aucun cookie publicitaire ou de tracking tiers n'est utilisé.",
    ],
  },
  {
    icon: Scale,
    title: "Propriété intellectuelle",
    content: [
      "L'ensemble des éléments constituant le site (design, textes, logos, icônes, images) est protégé par le droit de la propriété intellectuelle.",
      "Les utilisateurs conservent la propriété de leurs contenus (photos, textes d'annonces) mais accordent au site une licence d'utilisation non exclusive pour les besoins de la plateforme.",
      "Toute reproduction, représentation ou exploitation non autorisée du site est strictement interdite.",
    ],
  },
  {
    icon: RefreshCw,
    title: "Modification des mentions légales",
    content: [
      "Le Bon Plan Comores se réserve le droit de modifier les présentes mentions légales à tout moment. Les utilisateurs seront informés de toute modification substantielle.",
      "**Dernière mise à jour :** Février 2026",
    ],
  },
];

export default function MentionsLegales() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Scale className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">Informations légales</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground">
              Mentions Légales
            </h1>
            <p className="text-primary-foreground/80 mt-3 max-w-xl mx-auto">
              Toutes les informations légales relatives à l'utilisation du site Le Bon Plan Comores.
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="container py-12 max-w-4xl space-y-6">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <section
                key={idx}
                className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-card animate-fade-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                </div>
                <div className="space-y-3 pl-[52px]">
                  {section.content.map((line, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed text-muted-foreground"
                      dangerouslySetInnerHTML={{
                        __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>'),
                      }}
                    />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Contact CTA */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 text-center">
            <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">Une question ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Pour toute question relative aux mentions légales, contactez-nous.
            </p>
            <a
              href="mailto:bonplancomores@gmail.com"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Mail className="h-4 w-4" />
              bonplancomores@gmail.com
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
