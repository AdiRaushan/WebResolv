# Website Links - Complete Update Guide

## 🎯 Overview

Website links now appear in **TWO places**:

1. **Projects.html** - Dual buttons on project cards
2. **case-study.html** - "Visit Website" link in the header

## 📍 How to Update Website URLs

### For Projects.html (Project Cards)

**Location:** Each project card in `Projects.html`

**Find this code:**

```html
<!-- ✏️ UPDATE THIS URL -->
<a href="https://example.com" target="_blank" rel="noopener noreferrer"
```

**Update the `href` attribute with your website URL:**

```html
<a href="https://yourwebsite.com" target="_blank" rel="noopener noreferrer"
```

**Projects with URL placeholders in Projects.html:**

- Get Them: Line ~220 (currently `https://example.com`)
- Vista: Line ~256 (`#` - disabled)
- EvaraStaffing: Line ~281 (`#` - disabled)
- Pawier: Line ~328 (`#` - disabled)

**To Enable a Disabled Button:**
Replace:

```html
<a
  href="#"
  onclick="return false;"
  class="... opacity-50 cursor-not-allowed"
></a>
```

With:

```html
<a
  href="https://yourwebsite.com"
  target="_blank"
  rel="noopener noreferrer"
  class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
></a>
```

### For case-study.html (Header Link)

**Location:** JavaScript data object in `case-study.html` (around line 290-500)

**Find your project:**

```javascript
getthemall: {
  title: "Get Them",
  // ... other fields ...
  website: "https://example.com", // ✏️ UPDATE THIS
  images: [...]
},
```

**Update the URL:**

```javascript
website: "https://yourwebsite.com", // ✏️ UPDATED
```

## 🎨 Visual Guide

### On Projects.html:

When you hover over a project card, you'll see **TWO buttons**:

```
┌─────────────────────────────────────┐
│  [📖 Case Study]  [🔗 Visit Site]  │
└─────────────────────────────────────┘
```

- **Blue button** (Case Study) - Always active, opens case study page
- **Gray button** (Visit Site) - Opens live website in new tab

### On case-study.html:

In the project header, below the outcome stats:

```
LIVE WEBSITE
┌─────────────────────┐
│ 🔗 Visit Website    │
└─────────────────────┘
```

## 📝 Complete Project List

### Website Projects:

| Project       | Projects.html URL | case-study.html URL | Status             |
| ------------- | ----------------- | ------------------- | ------------------ |
| Get Them      | Line ~220         | Line ~292           | ✅ Has example.com |
| Vista         | Line ~256         | Line ~313           | ⬜ Disabled/Empty  |
| EvaraStaffing | Line ~281         | Line ~331           | ⬜ Disabled/Empty  |
| Pawier        | Line ~328         | Line ~350           | ⬜ Disabled/Empty  |

### Branding Projects (case-study.html only):

| Project       | case-study.html URL | Status   |
| ------------- | ------------------- | -------- |
| Kuro          | Line ~374           | ⬜ Empty |
| Aura          | Line ~393           | ⬜ Empty |
| Flux          | Line ~411           | ⬜ Empty |
| Artzen        | Line ~430           | ⬜ Empty |
| Flow          | Line ~449           | ⬜ Empty |
| Evara Rebrand | Line ~468           | ⬜ Empty |
| Tech Deck     | Line ~487           | ⬜ Empty |

## ✨ Button States

### Active Button:

```html
<a
  href="https://website.com"
  target="_blank"
  rel="noopener noreferrer"
  class="... transition-all"
>
  <i data-lucide="external-link" class="w-3 h-3"></i>
  Visit Site
</a>
```

### Disabled Button (placeholder):

```html
<a href="#" onclick="return false;" class="... opacity-50 cursor-not-allowed">
  <i data-lucide="external-link" class="w-3 h-3"></i>
  Visit Site
</a>
```

## 🚀 Quick Update Steps

1. **For Projects.html:**
   - Find the project card
   - Locate the comment `<!-- ✏️ UPDATE THIS URL -->`
   - Replace `href="#"` or `href="https://example.com"` with your URL
   - Remove `onclick="return false;"` if present
   - Remove `opacity-50 cursor-not-allowed` classes if present

2. **For case-study.html:**
   - Find the project in JavaScript section
   - Update the `website:` field with your URL
   - Save the file

## 🎯 Example: Complete Update

### Before (disabled):

```html
<!-- Projects.html -->
<a href="#" onclick="return false;" class="... opacity-50 cursor-not-allowed">
  <!-- case-study.html -->
  website: "", // Empty</a
>
```

### After (active):

```html
<!-- Projects.html -->
<a
  href="https://myawesomewebsite.com"
  target="_blank"
  rel="noopener noreferrer"
  class="inline-flex items-center gap-2 px-4 py-2 bg-white/10..."
>
  <!-- case-study.html -->
  website: "https://myawesomewebsite.com", // ✏️ UPDATED</a
>
```

---

**Need Help?** The website links are clearly marked with `✏️` comments in both files for easy updating!
