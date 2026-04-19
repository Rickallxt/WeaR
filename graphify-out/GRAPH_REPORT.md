# Graph Report - D:\Claude WeaR  (2026-04-18)

## Corpus Check
- Corpus is ~45,337 words - fits in a single context window. You may not need a graph.

## Summary
- 225 nodes · 371 edges · 20 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `requestJson()` - 10 edges
2. `readLegacySnapshot()` - 7 edges
3. `toSession()` - 6 edges
4. `requestJson()` - 6 edges
5. `readJson()` - 6 edges
6. `writeJson()` - 6 edges
7. `runUploadReviewFromMedia()` - 5 edges
8. `rebuild()` - 4 edges
9. `scheduleUploadMessage()` - 4 edges
10. `runUploadReview()` - 4 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (4): handleCreate(), handleKeyDown(), handleSave(), newCollection()

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (14): bootstrap(), createDraftFromIdentification(), handleAddExampleItems(), handleAuthAction(), handleCreateFromMedia(), handleDeleteMediaAsset(), handleReviewConfirm(), handleSignOut() (+6 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (7): createDraftFromIdentification(), handleAddExampleItems(), handleReviewConfirm(), handleUploadNewItem(), handleUploadPhoto(), runUploadReview(), scheduleUploadMessage()

### Community 3 - "Community 3"
Cohesion: 0.16
Nodes (16): getEventSession(), getProfile(), getSession(), requestJson(), requestPasswordReset(), resetPassword(), saveCollections(), saveEventSession() (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (2): checkIsMobile(), checkIsNative()

### Community 5 - "Community 5"
Cohesion: 0.24
Nodes (14): hasLegacySnapshot(), loadCollections(), loadEventSession(), loadOnboarded(), loadProfile(), loadWardrobe(), readJson(), readLegacySnapshot() (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.2
Nodes (10): async(), buildDemoOptions(), handleBuildOptions(), handleChatKeyDown(), handleChipClick(), handleClearSession(), handleItemUpload(), handleSendChat() (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.23
Nodes (10): fetchGenerationStatus(), requestEventChat(), requestJson(), requestWardrobeIdentification(), requestWardrobeImage(), requestWardrobeOptions(), buildDayPart(), buildEventLabel() (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.23
Nodes (5): buildWardrobeItem(), normalizeTags(), paletteFromColor(), parseTags(), slug()

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (3): handleChatSend(), handleStartChat(), sendAiReply()

### Community 10 - "Community 10"
Cohesion: 0.7
Nodes (4): _cleanup_cache(), main(), rebuild(), _write_readme()

### Community 11 - "Community 11"
Cohesion: 0.4
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 0.83
Nodes (3): createFashionMockImage(), garmentMarkup(), svgToDataUrl()

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 13`** (2 nodes): `WeaR-Launch.ps1`, `Test-ServerRunning()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `useAndroidKeyboard.ts`, `useAndroidKeyboard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (1 nodes): `capacitor.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `BottomSheet.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._