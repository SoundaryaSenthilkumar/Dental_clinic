// Gallery items use still frames from the hero video as placeholders.
// REPLACE: swap these for real clinic photos placed in public/assets/images/gallery/ and update the paths.
// `frame` = index in the frame sequence (1-based, matches frame_NNN.jpg).
export const GALLERY_CATEGORIES = ['All', 'Clinic', 'Equipment', 'Treatments'];

export const GALLERY_ITEMS = [
  { id: 'g1', frame: 1, category: 'Clinic', alt: 'Bright, modern treatment room with a blue dental chair and wall-mounted monitors', caption: 'Treatment room' },
  { id: 'g2', frame: 60, category: 'Equipment', alt: 'Panoramic dental X-ray displayed on a monitor in the treatment room', caption: 'Digital imaging' },
  { id: 'g3', frame: 120, category: 'Equipment', alt: 'Dental unit with instrument trays and a basin beside the treatment chair', caption: 'Instruments & dental unit' },
  { id: 'g4', frame: 160, category: 'Treatments', alt: 'Dentist examining a patient in a modern dental chair', caption: 'Consultation & examination' },
  { id: 'g5', frame: 200, category: 'Clinic', alt: 'Clean, well-lit clinical interior with blue and white finishes', caption: 'Clinic interior' },
];
