// Treatment descriptions are general educational text, not clinic-specific claims.
// The `name` values must match backend/src/utils/constants.js exactly.
import { Smile, Sparkles, Stethoscope, Syringe, Sun, Activity, Crown, Baby } from 'lucide-react';

export const TREATMENTS = [
  {
    name: 'General Dentistry',
    icon: Stethoscope,
    summary: 'Routine check-ups, examinations and treatment for everyday oral health needs.',
    details: 'Regular examinations help identify issues early, when they are simpler and more comfortable to treat.',
  },
  {
    name: 'Teeth Cleaning',
    icon: Sparkles,
    summary: 'Professional cleaning that removes plaque and tartar for healthier gums.',
    details: 'Professional cleaning reaches areas that brushing and flossing can miss, supporting long-term gum health.',
  },
  {
    name: 'Root Canal Treatment',
    icon: Syringe,
    summary: 'Careful treatment to save an infected or damaged tooth.',
    details: 'Root canal treatment removes infected tissue from inside a tooth so it can be preserved.',
  },
  {
    name: 'Dental Implants',
    icon: Crown,
    summary: 'Durable tooth replacement designed to look and function naturally.',
    details: 'Your dentist will assess suitability and discuss the planning and timeline during consultation.',
  },
  {
    name: 'Teeth Whitening',
    icon: Sun,
    summary: 'Brightening options discussed and planned around your teeth and goals.',
    details: 'Suitability depends on your oral health. Your dentist will explain the available options at your consultation.',
  },
  {
    name: 'Orthodontics and Braces',
    icon: Activity,
    summary: 'Straightening and alignment with braces or clear aligners.',
    details: 'Orthodontic plans are personalised after assessment. Options and timelines vary by patient.',
  },
  {
    name: 'Cosmetic Dentistry',
    icon: Smile,
    summary: 'Aesthetic treatments to enhance the look of your smile.',
    details: 'Cosmetic plans are tailored to your facial features, bite and oral health.',
  },
  {
    name: 'Pediatric Dentistry',
    icon: Baby,
    summary: 'Gentle, age-appropriate dental care for children and teens.',
    details: 'Early, positive dental visits help children build confidence and healthy habits.',
  },
];
