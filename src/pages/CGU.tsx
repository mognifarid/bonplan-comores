import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FileText, ShieldCheck, AlertTriangle, Ban, CreditCard, MessageSquare, UserX, Scale, RefreshCw, Mail } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    title: "1. Objet",
    content: [
      "Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») ont pour objet de définir les modalités et conditions d'utilisation du site **Le Bon Plan Comores**, accessible à l'adresse bonplan-comores.lovable.app.",
      "Toute utilisation du site implique l'acceptation sans réserve des présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le site.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "2. Inscription et compte utilisateur",
    content: [
      "L'accès à certaines fonctionnalités du site (publication d'annonces, messagerie, favoris, avis) nécessite la création d'un compte utilisateur.",
      "L'utilisateur s'engage à fournir des **informations exactes et à jour** lors de son inscription.",
      "L'utilisateur est seul responsable de la **confidentialité de ses identifiants** de connexion. Toute activité réalisée depuis son compte est réputée effectuée par lui.",
      "En cas d'utilisation frauduleuse de son compte, l'utilisateur doit en informer immédiatement l'équipe du site à l'adresse **bonplancomores@gmail.com**.",
    ],
  },
  {
    icon: FileText,
    title: "3. Publication d'annonces",
    content: [
      "Les utilisateurs inscrits peuvent publier des annonces gratuitement sur la plateforme.",
      "Chaque annonce doit respecter les règles suivantes :",
      "• Décrire un bien ou service **réel et disponible**",
      "• Contenir des informations **exactes et non trompeuses**",
      "• Ne pas proposer de biens ou services **illicites** (contrefaçons, substances illégales, armes, etc.)",
      "• Ne pas contenir de contenu **offensant, discriminatoire ou diffamatoire**",
      "• Être classée dans la **catégorie appropriée**",
      "• Les photos doivent correspondre au bien ou service proposé",
      "Les annonces sont soumises à **modération** avant publication. L'équipe se réserve le droit de refuser ou supprimer toute annonce ne respectant pas ces règles.",
    ],
  },
  {
    icon: CreditCard,
    title: "4. Services payants – Boost d'annonces",
    content: [
      "Le site propose des options payantes de mise en avant des annonces :",
      "• **Vedette** : l'annonce est mise en avant dans la section des annonces vedettes",
      "• **Urgent** : l'annonce est signalée comme urgente pour attirer l'attention des acheteurs",
      "• **Remontée** : l'annonce est remontée en tête des résultats de recherche",
      "Les paiements sont effectués via **Stripe**, un prestataire de paiement sécurisé. Le Bon Plan Comores ne stocke aucune donnée bancaire.",
      "Les services de boost sont **non remboursables** une fois activés, sauf en cas de dysfonctionnement technique avéré.",
    ],
  },
  {
    icon: MessageSquare,
    title: "5. Messagerie et avis",
    content: [
      "La plateforme met à disposition un système de **messagerie** permettant aux utilisateurs de communiquer entre eux.",
      "Les utilisateurs peuvent également laisser des **avis** sur les vendeurs. Ces avis sont soumis à **modération** avant publication.",
      "Il est interdit d'utiliser la messagerie ou les avis pour :",
      "• Envoyer du **spam** ou des messages non sollicités",
      "• **Harceler, menacer ou insulter** d'autres utilisateurs",
      "• Diffuser des **contenus illicites** ou des liens malveillants",
      "• Tenter de réaliser des transactions **en dehors de la plateforme** de manière frauduleuse",
    ],
  },
  {
    icon: AlertTriangle,
    title: "6. Signalements",
    content: [
      "Les utilisateurs peuvent **signaler** toute annonce ou comportement suspect via la fonctionnalité de signalement intégrée.",
      "L'équipe de modération s'engage à examiner chaque signalement dans les **meilleurs délais**.",
      "Les signalements abusifs ou répétés pourront entraîner la **suspension du compte** de l'auteur.",
    ],
  },
  {
    icon: Ban,
    title: "7. Comportements interdits",
    content: [
      "Sont strictement interdits sur la plateforme :",
      "• La publication de **fausses annonces** ou d'annonces trompeuses",
      "• L'**usurpation d'identité** ou la création de faux comptes",
      "• Toute tentative de **fraude ou d'escroquerie**",
      "• La collecte automatisée de données (**scraping**)",
      "• Toute action visant à **perturber le fonctionnement** du site",
      "• La revente ou l'exploitation commerciale des données du site",
    ],
  },
  {
    icon: UserX,
    title: "8. Suspension et suppression de compte",
    content: [
      "L'équipe du site se réserve le droit de **suspendre ou supprimer** tout compte utilisateur en cas de :",
      "• Violation des présentes CGU",
      "• Publication répétée d'annonces non conformes",
      "• Comportement frauduleux ou abusif",
      "• Signalements multiples de la part d'autres utilisateurs",
      "En cas de suspension, l'utilisateur sera informé par email des motifs de la décision.",
    ],
  },
  {
    icon: Scale,
    title: "9. Responsabilité",
    content: [
      "**Le Bon Plan Comores** agit en qualité de simple intermédiaire technique entre les utilisateurs. À ce titre :",
      "• Le site **ne garantit pas** la qualité, la légalité ou la conformité des biens et services proposés",
      "• Le site **n'intervient pas** dans les transactions entre utilisateurs",
      "• Le site **ne peut être tenu responsable** des litiges, pertes ou dommages résultant de transactions entre utilisateurs",
      "Les utilisateurs sont invités à prendre toutes les précautions nécessaires lors de leurs transactions (vérification du bien, paiement sécurisé, rencontre dans un lieu public, etc.).",
    ],
  },
  {
    icon: RefreshCw,
    title: "10. Modification des CGU",
    content: [
      "Le Bon Plan Comores se réserve le droit de **modifier les présentes CGU** à tout moment. Les utilisateurs seront informés de toute modification substantielle.",
      "La poursuite de l'utilisation du site après modification des CGU vaut **acceptation des nouvelles conditions**.",
      "**Date d'entrée en vigueur :** Février 2026",
    ],
  },
];

export default function CGU() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-hero py-12 md:py-16">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <FileText className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">Conditions d'utilisation</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-primary-foreground/80 mt-3 max-w-xl mx-auto">
              Veuillez lire attentivement les conditions ci-dessous avant d'utiliser Le Bon Plan Comores.
            </p>
          </div>
        </section>

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

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-8 text-center">
            <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground mb-2">Des questions sur les CGU ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              N'hésitez pas à nous contacter pour toute clarification.
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
