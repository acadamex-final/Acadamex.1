/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Teacher {
  id: string;
  name: string;
  universityId: string;
  collegeId: string;
  courseId: string;
  subject: string;
  averageRating: number;
  reviewCount: number;
  pedagogyScore: number; // 1-10
  strictnessScore: number; // 1-10
  gradingScore: number; // 1-10
  tags: Record<string, number>;
  status: 'pending' | 'active' | 'rejected';
  createdBy: string;
  createdByName: string;
  approvedAt?: any;
  createdAt: any;
  updatedAt: any;
}

export interface Review {
  id: string;
  teacherId: string;
  userId: string;
  userName?: string;
  collegeId: string;
  rating: number; // Overall
  pedagogy: number;
  strictness: number;
  grading: number;
  content: string;
  semester: string;
  anonymous: boolean;
  tagsProvided: string[];
  createdAt: number;
  updatedAt?: number;
}

export interface MarketItem {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail?: string;
  universityId: string;
  collegeId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: 'books' | 'electronics' | 'gadgets' | 'transport' | 'education' | 'clothing_fashion' | 'other';
  condition: 'new' | 'used-excellent' | 'used-good' | 'used-fair';
  contactInfo: string;
  contactPhone: string;
  images: string[];
  status: 'available' | 'sold' | 'expired';
  createdAt: any;
  expiresAt: any;
}

export interface UserAudit {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  loginAt: any;
  ipAddress?: string;
}

export interface DiscussionPost {
  id: string;
  userId: string;
  userName: string;
  content: string;
  tags: string[];
  replyCount: number;
  likes: string[]; // userIds
  collegeId: string;
  createdAt: any;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  resolved: boolean;
  resolvedAt?: any;
  createdAt: any;
  updatedAt: any;
  issueType?: 'missing_subject' | 'incorrect_syllabus' | 'incorrect_faculty' | 'spam_listing' | 'technical_bug' | 'other_issue' | string;
  collegeId?: string;
  collegeName?: string;
  courseId?: string;
  courseName?: string;
  missingSubject?: string;
  attachedPhoto?: string;
}

export interface College {
  id: string;
  name: string;
  city: string;
  domain?: string;
}

export interface Placement {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  collegeId: string;
  company: string;
  role: string;
  type: 'placement' | 'referral';
  status?: string;
  linkedin?: string;
  description: string;
  createdAt: number;
}

export interface AcademicGigAttachment {
  name: string;
  type: 'image' | 'pdf';
  size: number;
  dataUrl: string;
}

export interface AcademicGig {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  description: string;
  payout: number;
  subject: string;
  collegeId: string;
  status: 'available' | 'assigned' | 'completed';
  contactInfo?: string;
  contactPhone?: string;
  createdAt: number;
  workType: 'assignment' | 'eg_sheet' | 'cad_layout' | 'written_files' | 'others';
  attachments?: AcademicGigAttachment[];
}
