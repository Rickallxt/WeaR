# Graph Report - D:\Claude WeaR  (2026-04-24)

## Corpus Check
- 147 files · ~67,417 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 316 nodes · 499 edges · 30 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `requestJson()` - 10 edges
2. `generateWithComfyUi()` - 8 edges
3. `buildFallbackIdentification()` - 8 edges
4. `readJson()` - 8 edges
5. `writeJson()` - 8 edges
6. `readLegacySnapshot()` - 8 edges
7. `openAIResponses()` - 6 edges
8. `rebuild()` - 6 edges
9. `generateWithLocalAi()` - 6 edges
10. `toSession()` - 6 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (4): handleKeyDown(), handleSave(), getTabForScreen(), normalizeScreenKey()

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (5): buildWardrobeItem(), normalizeTags(), paletteFromColor(), parseTags(), slug()

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (19): clearCookieHeader(), extractBase64Image(), fetchJson(), getAiStatus(), handleChat(), handleIdentify(), handleImage(), handleOptions() (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.17
Nodes (19): hasLegacySnapshot(), loadCollections(), loadEventSession(), loadOnboarded(), loadOutfits(), loadProfile(), loadWardrobe(), migrateCollectionsToOutfits() (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (10): buildCoverImage(), buildGreeting(), createId(), dedupeItems(), normalizeStoredMessages(), optionToLook(), readSessionAsChat(), resolveSelectedItems() (+2 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (16): getEventSession(), getProfile(), getSession(), requestJson(), requestPasswordReset(), resetPassword(), saveCollections(), saveEventSession() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (16): buildLocalImagePrompt(), collectGarmentReferences(), collectPersonReferences(), configuredProvider(), extractComfyImageRef(), fetchImageAsDataUrl(), generateWithComfyUi(), generateWithFreeImageProvider() (+8 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (3): checkIsMobile(), checkIsNative(), isPresentation()

### Community 8 - "Community 8"
Cohesion: 0.19
Nodes (8): fetchGenerationStatus(), requestEventChat(), requestJson(), requestWardrobeIdentification(), requestWardrobeImage(), requestWardrobeOptions(), queueOutfitForChat(), resolveOutfitPreviewUrl()

### Community 9 - "Community 9"
Cohesion: 0.18
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.27
Nodes (6): buildFallbackChat(), buildFallbackImage(), buildFallbackOptions(), buildSvgCollage(), optionCountForItems(), safeSelectedItems()

### Community 11 - "Community 11"
Cohesion: 0.42
Nodes (8): articleFor(), buildFallbackIdentification(), descriptorForCategory(), detectCategory(), detectColor(), detectFit(), detectMaterial(), titleCase()

### Community 12 - "Community 12"
Cohesion: 0.43
Nodes (6): handleChat(), handleIdentify(), handleImage(), handleOptions(), json(), openAIResponses()

### Community 13 - "Community 13"
Cohesion: 0.52
Nodes (6): _cleanup_cache(), main(), _prepare_extraction_paths(), rebuild(), _restore_mirrored_sources(), _write_readme()

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 0.83
Nodes (3): createFashionMockImage(), garmentMarkup(), svgToDataUrl()

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 19`** (2 nodes): `WeaR-Launch.ps1`, `Test-ServerRunning()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `useAndroidKeyboard.ts`, `useAndroidKeyboard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `capacitor.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `preload.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `appSchemas.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `schemas.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `wardrobe-engine.test.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._