import { 
  User, 
  Partner, 
  Document, 
  Approval, 
  partnerTypes, 
  onboardingStatuses,
  CompanyInfoFormData,
  SecurityFormData,
  InterfaceFormData,
  ReviewFormData
} from "@shared/schema";

export type PartnerType = typeof partnerTypes[number];
export type OnboardingStatus = typeof onboardingStatuses[number];

export interface PartnerWithDocuments extends Partner {
  documents?: Document[];
}

export interface PartnerWithApproval {
  id: number;
  userId: number;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  partnerType: PartnerType;
  status: OnboardingStatus;
  submittedAt: string | Date | null;
  approvedAt: string | Date | null;
  rejectedAt: string | Date | null;
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
  partnerId?: number;
  approval?: Approval;
  documents?: Document[];
  user?: User;
  isEnhanced?: boolean;
  certificateId?: number | string;
  interfaceConfig?: {
    security?: {
      selectedCertificateId?: string | number;
      certificateDetails?: {
        id: number;
        name: string;
        alias?: string;
        fileName?: string;
        storageUrl?: string;
      }
    };
    interface?: {
      protocol: string;
      authType: string;
      endpoints: {
        name: string;
        url: string;
      }[];
    };
    review?: {
      acceptTerms: boolean;
    };
  };
}

// Step type removed as part of progress tracking removal

export type OnboardingFormData = {
  companyInfo: CompanyInfoFormData;
  security: SecurityFormData;
  interface: InterfaceFormData;
  review: ReviewFormData;
}

export type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
}

export type NavSection = {
  title: string;
  items: NavItem[];
}

export type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export type StatCard = {
  title: string;
  value: number;
  change: number;
  icon: React.ComponentType<any>;
  iconBgColor: string;
  iconColor: string;
  href?: string;
}
