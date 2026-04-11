import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFallbackChat,
  buildFallbackImage,
  buildFallbackOptions,
  optionCountForItems,
  parseJsonFromText,
} from '../server/wardrobeEngine.mjs';

const sampleItems = [
  { id: 'w1', name: 'Bone cropped bomber', imageDataUrl: 'data:image/png;base64,abc' },
  { id: 'w2', name: 'Black column trouser', imageDataUrl: 'data:image/png;base64,def' },
  { id: 'w3', name: 'Silver low sneaker', imageDataUrl: null },
  { id: 'w4', name: 'Soft knit tank', imageDataUrl: null },
];

test('optionCountForItems returns the right option bands', () => {
  assert.equal(optionCountForItems(0), 0);
  assert.equal(optionCountForItems(1), 1);
  assert.equal(optionCountForItems(2), 1);
  assert.equal(optionCountForItems(3), 2);
  assert.equal(optionCountForItems(5), 2);
  assert.equal(optionCountForItems(6), 3);
});

test('buildFallbackOptions only uses selected wardrobe ids', () => {
  const options = buildFallbackOptions(sampleItems, 'Rooftop dinner');

  assert.equal(options.length, 2);
  assert.deepEqual(options[0].itemIds, ['w1', 'w2', 'w3', 'w4']);
  assert.ok(options.every((option) => option.eventFit.includes('Rooftop dinner')));
});

test('buildFallbackChat keeps the event summary and wardrobe context', () => {
  const chat = buildFallbackChat({
    userMessage: 'Outdoor wedding at sunset',
    selectedItems: sampleItems,
  });

  assert.equal(chat.summary, 'Outdoor wedding at sunset');
  assert.match(chat.reply, /Outdoor wedding at sunset|prioritize pieces/i);
  assert.match(chat.reply, /Bone cropped bomber/);
});

test('parseJsonFromText extracts JSON from wrapped model output', () => {
  const parsed = parseJsonFromText('Here you go:\n{"reply":"Test","summary":"Event"}\nThanks.');

  assert.deepEqual(parsed, { reply: 'Test', summary: 'Event' });
});

test('buildFallbackImage always returns a renderable data URL', () => {
  const emptyImage = buildFallbackImage({ selectedItems: [], option: null });
  const filledImage = buildFallbackImage({
    selectedItems: sampleItems,
    option: { title: 'Event-ready edit' },
  });

  assert.match(emptyImage.imageDataUrl, /^data:image\/svg\+xml;base64,/);
  assert.match(filledImage.imageDataUrl, /^data:image\/svg\+xml;base64,/);
  assert.equal(emptyImage.mode, 'demo');
  assert.equal(filledImage.revisedPrompt, 'Demo mode preview using Event-ready edit.');
});
