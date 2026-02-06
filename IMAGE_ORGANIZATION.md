# Image Organization - Folder Structure

## 📁 New Folder Structure

All project images have been organized into a clean folder structure:

```
webresolv/
├── assets/
│   └── projects/
│       ├── getthemall/
│       │   ├── Getthem.png
│       │   ├── getthem2.jpg
│       │   ├── getthem3.png
│       │   └── getthem4.png
│       │
│       ├── bella-vista/
│       │   ├── bella1.png
│       │   ├── bella2.png
│       │   ├── bella3.png
│       │   ├── bella4.png
│       │   └── la bella vista.png
│       │
│       ├── evara/
│       │   ├── Evara1.png
│       │   ├── Evara2.png
│       │   ├── Evara3.png
│       │   └── Evara4.png
│       │
│       ├── pawier/
│       │   ├── pawier.png
│       │   ├── Pawier1.png
│       │   ├── Pawier2.png
│       │   ├── Pawier3.png
│       │   └── Pawier4.png
│       │
│       └── peak-pine/
│           └── Peak & Pine.png
│
├── favicon.svg
├── index.html
├── Projects.html
└── case-study.html
```

## ✅ Updated Files

All image references have been updated in:

### 1. **index.html**

- ✅ Peak & Pine marquee image
- ✅ Bella Vista marquee image
- ✅ Evara marquee image
- ✅ Pawier marquee image

### 2. **Projects.html**

- ✅ Get Them project card
- ✅ Bella Vista project card
- ✅ Evara project card
- ✅ Pawier project card

### 3. **case-study.html**

- ✅ Get Them images array
- ✅ Bella Vista images array
- ✅ Evara images array
- ✅ Pawier images array

## 🎯 Path Format

All images now use the format:

```
assets/projects/{project-name}/{image-file}
```

**Examples:**

- `assets/projects/getthemall/Getthem.png`
- `assets/projects/bella-vista/bella1.png`
- `assets/projects/evara/Evara1.png`
- `assets/projects/pawier/Pawier3.png`

## 📝 Adding New Project Images

To add images for a new project:

1. **Create a new project folder:**

   ```bash
   mkdir assets\projects\new-project-name
   ```

2. **Add your images to the folder:**

   ```
   assets/projects/new-project-name/
   ├── image1.png
   ├── image2.png
   └── image3.png
   ```

3. **Update the HTML files:**

   ```html
   <!-- In index.html, Projects.html, or case-study.html -->
   <img src="assets/projects/new-project-name/image1.png" />
   ```

4. **Update case-study.html JavaScript:**
   ```javascript
   newproject: {
     // ... other fields ...
     images: [
       "assets/projects/new-project-name/image1.png",
       "assets/projects/new-project-name/image2.png",
       "assets/projects/new-project-name/image3.png",
     ],
   },
   ```

## 🚀 Benefits

✨ **Organized** - Each project has its own dedicated folder
✨ **Scalable** - Easy to add new projects without cluttering the root
✨ **Maintainable** - Clear structure makes it easy to find and manage images
✨ **Professional** - Industry-standard asset organization
✨ **Version Control Friendly** - Better git history and diffs

## 🔍 Other Assets

**Remaining in root:**

- `favicon.svg` - Website favicon (kept in root for easy browser access)

**Other folders you might want to create:**

- `assets/logos/` - For client logos
- `assets/icons/` - For UI icons
- `assets/misc/` - For miscellaneous images

---

**Status:** ✅ All images organized and all links updated successfully!
