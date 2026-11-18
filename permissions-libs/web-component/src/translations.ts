/**
 * Translations for the hotosm-share-dialog web component.
 * `{name}` placeholders are filled by `format()` in the component.
 **/

export interface Translations {
  dialogLabel: string;
  addPlaceholder: string;
  addEmail: string;
  accessSection: string;
  person: string;
  team: string;
  organization: string;
  owner: string;
  unknownName: string;
  removeAccess: string;
  summary: string;
  peopleSingular: string;
  peoplePlural: string;
  teamsSingular: string;
  teamsPlural: string;
  orgsSingular: string;
  orgsPlural: string;
  linkLabel: string;
  linkNone: string;
  linkWarning: string;
  attributionLabel: string;
  attributionPersonal: string;
  attributionHelp: string;
  copyLink: string;
  linkCopied: string;
  linkCopyError: string;
  done: string;
  cannotShare: string;
  loadError: string;
  errorGeneric: string;
  errorUserNotFound: string;
  errorAlreadyOwner: string;
}

export const translations: Record<string, Translations> = {
  en: {
    dialogLabel: "Share",
    addPlaceholder: "Add people, teams and organizations",
    addEmail: "Add {email}",
    accessSection: "Access",
    person: "Person",
    team: "Team",
    organization: "Organization",
    owner: "Owner",
    unknownName: "Unknown",
    removeAccess: "Remove access",
    summary: "Shared with {list}",
    peopleSingular: "{count} person",
    peoplePlural: "{count} people",
    teamsSingular: "{count} team",
    teamsPlural: "{count} teams",
    orgsSingular: "{count} organization",
    orgsPlural: "{count} organizations",
    linkLabel: "Anyone with the link",
    linkNone: "No access",
    linkWarning: "Anyone with the link can see it.",
    attributionLabel: "By",
    attributionPersonal: "{name} (personal)",
    attributionHelp:
      "Shows it on behalf of an organization. It doesn't give the organization access.",
    copyLink: "Copy link",
    linkCopied: "Link copied",
    linkCopyError: "Couldn't copy the link",
    done: "Done",
    cannotShare: "You can't manage who has access to this item.",
    loadError: "Couldn't load who has access",
    errorGeneric: "Couldn't update access",
    errorUserNotFound: "No account found for that email",
    errorAlreadyOwner: "That person already owns this item",
  },
  es: {
    dialogLabel: "Compartir",
    addPlaceholder: "Agregar personas, equipos y organizaciones",
    addEmail: "Agregar {email}",
    accessSection: "Acceso",
    person: "Persona",
    team: "Equipo",
    organization: "Organización",
    owner: "Propietario",
    unknownName: "Desconocido",
    removeAccess: "Quitar acceso",
    summary: "Compartido con {list}",
    peopleSingular: "{count} persona",
    peoplePlural: "{count} personas",
    teamsSingular: "{count} equipo",
    teamsPlural: "{count} equipos",
    orgsSingular: "{count} organización",
    orgsPlural: "{count} organizaciones",
    linkLabel: "Cualquiera con el enlace",
    linkNone: "Sin acceso",
    linkWarning: "Cualquiera con el enlace puede verlo.",
    attributionLabel: "Por",
    attributionPersonal: "{name} (personal)",
    attributionHelp:
      "Lo muestra a nombre de una organización. No le da acceso a la organización.",
    copyLink: "Copiar enlace",
    linkCopied: "Enlace copiado",
    linkCopyError: "No se pudo copiar el enlace",
    done: "Listo",
    cannotShare: "No se puede administrar el acceso a este elemento.",
    loadError: "No se pudo cargar quién tiene acceso",
    errorGeneric: "No se pudo actualizar el acceso",
    errorUserNotFound: "No hay ninguna cuenta con ese email",
    errorAlreadyOwner: "Esa persona ya es propietaria de este elemento",
  },
  fr: {
    dialogLabel: "Partager",
    addPlaceholder: "Ajouter des personnes, équipes et organisations",
    addEmail: "Ajouter {email}",
    accessSection: "Accès",
    person: "Personne",
    team: "Équipe",
    organization: "Organisation",
    owner: "Propriétaire",
    unknownName: "Inconnu",
    removeAccess: "Retirer l'accès",
    summary: "Partagé avec {list}",
    peopleSingular: "{count} personne",
    peoplePlural: "{count} personnes",
    teamsSingular: "{count} équipe",
    teamsPlural: "{count} équipes",
    orgsSingular: "{count} organisation",
    orgsPlural: "{count} organisations",
    linkLabel: "Toute personne disposant du lien",
    linkNone: "Aucun accès",
    linkWarning: "Toute personne disposant du lien peut le voir.",
    attributionLabel: "Par",
    attributionPersonal: "{name} (personnel)",
    attributionHelp:
      "L'affiche au nom d'une organisation. Cela ne donne pas accès à l'organisation.",
    copyLink: "Copier le lien",
    linkCopied: "Lien copié",
    linkCopyError: "Impossible de copier le lien",
    done: "Terminé",
    cannotShare: "Vous ne pouvez pas gérer qui a accès à cet élément.",
    loadError: "Impossible de charger qui a accès",
    errorGeneric: "Impossible de mettre à jour l'accès",
    errorUserNotFound: "Aucun compte trouvé pour cet e-mail",
    errorAlreadyOwner: "Cette personne est déjà propriétaire de cet élément",
  },
  pt: {
    dialogLabel: "Compartilhar",
    addPlaceholder: "Adicionar pessoas, equipes e organizações",
    addEmail: "Adicionar {email}",
    accessSection: "Acesso",
    person: "Pessoa",
    team: "Equipe",
    organization: "Organização",
    owner: "Proprietário",
    unknownName: "Desconhecido",
    removeAccess: "Remover acesso",
    summary: "Compartilhado com {list}",
    peopleSingular: "{count} pessoa",
    peoplePlural: "{count} pessoas",
    teamsSingular: "{count} equipe",
    teamsPlural: "{count} equipes",
    orgsSingular: "{count} organização",
    orgsPlural: "{count} organizações",
    linkLabel: "Qualquer pessoa com o link",
    linkNone: "Sem acesso",
    linkWarning: "Qualquer pessoa com o link pode vê-lo.",
    attributionLabel: "Por",
    attributionPersonal: "{name} (pessoal)",
    attributionHelp:
      "Mostra em nome de uma organização. Não dá acesso à organização.",
    copyLink: "Copiar link",
    linkCopied: "Link copiado",
    linkCopyError: "Não foi possível copiar o link",
    done: "Concluir",
    cannotShare: "Você não pode gerenciar quem tem acesso a este item.",
    loadError: "Não foi possível carregar quem tem acesso",
    errorGeneric: "Não foi possível atualizar o acesso",
    errorUserNotFound: "Nenhuma conta encontrada para esse e-mail",
    errorAlreadyOwner: "Essa pessoa já é proprietária deste item",
  },
};
