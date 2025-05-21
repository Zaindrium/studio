# Digital Business Card Component Design - LinkUP

This document outlines the design specifications for a professional, modern, and customizable digital business card component, inspired by HiHello's clean layout and tailored for the LinkUP application.

## 1. Core Objective
To create a reusable digital business card component that allows users to display their professional information in an aesthetically pleasing and highly customizable manner, integrated within a dark-themed interface.

## 2. Layout Structure

The card will be divided into distinct sections for clarity and visual appeal.

### 2.1. Header Section
*   **Curved Vector Wave (SVG/CSS Clip-path)**:
    *   Acts as a color-accented divider.
    *   Color: User-defined Accent Color.
    *   Position: Separates the top identity elements (image, logo) from the textual information below.
    *   Customization: Movable (top/bottom/center overlay position relative to the top section), opacity adjustable.
*   **Profile Image**:
    *   Placement: Top-left.
    *   Shape: Circular mask (default) or square with rounded corners (adjustable).
    *   Size: Prominent, e.g., 80x80px to 100x100px.
    *   Editable: Via image picker with auto-crop and reposition options.
*   **Company Logo Icon**:
    *   Placement: Top-right.
    *   Type: Editable SVG. Users can upload their company logo.
    *   Size: Scaled appropriately to balance with the profile image, e.g., 40x40px or responsive to container.
*   **Optional Background Image**:
    *   Placement: Behind the profile image and potentially extending into the header area.
    *   Control: User uploadable, with opacity/blur options to ensure text readability.

### 2.2. Information Section (Below Wave Divider)
*   **Full Name**:
    *   Style: Bold.
    *   Typography: See section 4.
*   **Job Title**:
    *   Style: Regular.
    *   Typography: See section 4.
*   **Department** (or Role):
    *   Style: Semi-bold.
    *   Color: User-defined Accent Color.
    *   Typography: See section 4.
*   **Company Name**:
    *   Style: Italic.
    *   Typography: See section 4.

## 3. Color System

The component will primarily use a dark theme, with user-configurable accents.

*   **Overall UI Background**: Dark mode (e.g., `#0d0d0d`).
*   **Card Background**: Slightly lighter dark shade (e.g., `#1a1a1a` or `#1F1F1F`) to distinguish from the page background.
*   **Primary Accent Color**: User-defined (e.g., via color wheel or hex input). Default could be LinkUP's brand accent (`#7E57C2`) or a vibrant option. This color will be used for:
    *   The vector wave divider.
    *   Department/Role text.
    *   Active tab indicators.
    *   Primary action buttons (if any directly on the card).
*   **Text Colors**:
    *   Primary Text (Name, Titles): White (`#ffffff`).
    *   Secondary Text (Field labels, less important info): Gray variants (e.g., `#cccccc`, `#A0A0A0`).
*   **Icon Colors**: Match secondary text color, or user-defined accent for specific icons if desired.

## 4. Typography

Clean, sans-serif fonts will be used for readability and a modern feel.

*   **Font Family Selection**:
    *   Allow user selection from a curated list (e.g., Nunito Sans, Montserrat, Inter, Open Sans).
    *   Integration via Google Fonts API or custom font loader.
*   **Font Hierarchy & Sizes**:
    *   **Full Name**: Bold, 20-24px.
    *   **Job Title**: Regular, 16px.
    *   **Department**: Semi-bold (using Accent Color), 14px.
    *   **Company Name**: Italic, 14px.
    *   **Contact Info Text**: Regular, 14px.
    *   **Section Headers (in configuration tabs)**: Semi-bold, 16-18px.

## 5. Vector / Shape Layer

Dynamic vector elements for enhanced visual customization.

*   **Primary Wave/Slanted Line**:
    *   Implementation: SVG path or CSS clip-path.
    *   Customization:
        *   Color: User-defined Accent Color.
        *   Position: Movable (e.g., overlay at top, middle, or bottom of the header area).
        *   Opacity: Adjustable (e.g., 0% to 100%).
        *   Style: Offer a few preset shapes (wave, slant, straight line).
*   **Additional Geometric SVGs**:
    *   Functionality: Allow users to add subtle background patterns or decorative elements (e.g., grid dots, circles, abstract curves).
    *   Customization: Adjustable color (can match accent or be a neutral shade), placement (drag-and-drop or coordinate-based), opacity, and scale.

## 6. Profile Section (Detail)

*   **Profile Photo**:
    *   Mask: Circular (default), option for rounded square.
    *   Editing:
        *   Image picker for upload.
        *   Features for auto-crop to fit the mask.
        *   Option to reposition/zoom image within the masked area.

## 7. Contact Info Section

Organized display of contact methods.

*   **Layout**: Vertical list.
    *   Icons: Left-aligned.
    *   Text: Right-aligned with the icon.
*   **Fields (Icon + Text Pairs)**:
    *   Phone (with "work" or "mobile" tags, selectable by user)
    *   Email
    *   Website
    *   WhatsApp
    *   Social Media: Facebook, LinkedIn, Instagram, Twitter/X, GitHub, etc. (user selectable from a list).
*   **Icons**:
    *   Source: Vector SVGs (for scalability and color customization) or a comprehensive icon library like Font Awesome.
    *   Customization: Icon color can be uniform (e.g., secondary text color) or individually themed if advanced customization is desired.

## 8. Tabs for Configuration

Dedicated tabs for editing different aspects of the card.

*   **Tab 1: Display**
    *   Change Accent Color (color picker, hex input).
    *   Select Font Family.
    *   Adjust Design Layout (if multiple core layouts are offered beyond "Classic").
    *   Customize Wave/Shape (style, position, opacity).
    *   Manage optional background image and additional geometric SVGs.
*   **Tab 2: Information**
    *   Edit Full Name.
    *   Edit Job Title.
    *   Edit Department.
    *   Edit Company Name.
    *   Upload/Edit Profile Photo.
    *   Upload/Edit Company Logo.
*   **Tab 3: Fields**
    *   Toggle on/off various contact links/fields (email, phone numbers, social media links).
    *   Add/edit/remove specific instances (e.g., multiple phone numbers, different social profiles).
    *   Select tags for phone numbers (work, mobile, home).

## 9. Templates / Card Types

Offer different visual styles, potentially tied to user plans. This aligns with the planned "Template Management" feature noted in `src/app/dashboard/templates/page.tsx`.

*   **Free Users**:
    *   Access to 1 standard layout (e.g., “Classic” – the one primarily described here).
*   **Pro Users**:
    *   Access to additional layouts (e.g., "Flat," "Modern," "Sleek," "Blend").
    *   These would be visually distinct templates, possibly altering the arrangement of elements, shape styles, or offering more advanced animation/interaction.
    *   Locked templates should display a "PRO" badge.

## 10. Save/Preview Functionality

*   **Live Preview**: The card design should update in real-time as users make changes in the configuration tabs. A dedicated preview area will show the card.
*   **Toggle Preview Mode**: Perhaps a full-screen or larger modal preview.
*   **"Save" Button**: Stores the current card configuration to the user's profile (Firebase Firestore or similar).

## 11. UX Notes

*   **Clarity, Spacing, Balance**: Prioritize these principles for a polished look. Ample whitespace.
*   **SaaS-Level Polish**: Interface should feel intuitive, responsive, and professional.
*   **Modularity & Editability**: All specified design elements should be easily editable by the user.
*   **Responsive Design**: The card itself and the configuration interface must be responsive for various screen sizes, especially mobile.

## 12. Developer Notes

*   **Shapes (Wave Divider)**: Implement using SVGs (for complex curves and scalability) or CSS `clip-path` (for simpler shapes if performance is a concern). SVGs are generally more flexible for intricate designs.
*   **Dynamic Theming**: Use CSS Custom Properties (variables) for colors and potentially font families to allow easy JavaScript manipulation for user customization. If using Tailwind CSS, configure `tailwind.config.ts` to support these dynamic values or extend the theme.
*   **Font Selection**: Integrate with Google Fonts API or host font files locally. Ensure proper font loading and application.
*   **Layout**: Utilize Flexbox and/or CSS Grid for responsive spacing and arrangement of fields and sections.
*   **Component-Based Structure**: If using a framework like React (Next.js is in the project), Vue, or Angular, build as a collection of smaller, reusable sub-components (e.g., `ProfileImage`, `ContactField`, `ColorPicker`).
*   **State Management**: Use React Context, Zustand, Redux, or similar for managing the card's state during customization, especially across different configuration tabs.

## 13. Optional Extras (Future Enhancements)

*   **Animated Transitions**: Smooth animations when switching tabs or when elements appear/update.
*   **Export Options**:
    *   Export to PNG: For sharing as an image.
    *   Export to vCard (.vcf): For easy addition to contacts apps.
*   **QR Code Auto-Generator**:
    *   Generate a QR code on the final card preview that links to the user's LinkUP profile or shares their vCard data. This aligns with existing "QR code generation feature" in `docs/blueprint.md`.

This design document should serve as a comprehensive guide for developing the digital business card component.
