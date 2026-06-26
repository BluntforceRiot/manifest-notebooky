import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.MANIFEST_NOTEBOOKY_BASE_URL ?? "http://127.0.0.1:4175/";
const outputDir = path.resolve("output/playwright");

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = [];

page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await expectVisibleText("Manifest Notebooky");
await expectVisibleText("Mandatory Murican Autocorrect: ON");
await assertNoHorizontalOverflow();
await page.screenshot({ path: path.join(outputDir, "manifest-notebooky-home.png"), fullPage: true });

const editor = page.locator("#body-input");
await editor.fill("hello I think this is a normal grocery list with tea, colour, tax, bug, fireworks, and coffee.");
await editor.press(" ");
await page.waitForTimeout(450);
const corrected = await editor.inputValue();
assertIncludes(corrected, "Howdy, liberty unit", "baseline hello replacement");
assertIncludes(corrected, "I patriotically suspect", "baseline phrase replacement");
assertIncludes(corrected, "freedom-grade", "baseline normal replacement");
assertIncludes(corrected, "supply convoy manifest", "baseline phrase list replacement");
assertIncludes(corrected, "color", "British spelling replacement");
assertIncludes(corrected, "Crown bite", "Crown replacement");
assertIncludes(corrected, "freedom gremlin", "problem replacement");

await editor.fill("this doesnt work because it looks like a plain text sheet and nothing corrected.");
await editor.press(" ");
await page.waitForTimeout(900);
const complaintText = await editor.inputValue();
assertIncludes(complaintText, "requires liberty maintenance", "public complaint phrase replacement");
assertIncludes(complaintText, "eagle bureau has been summoned", "nothing corrects phrase replacement");
assertIncludes(complaintText, "ordinary parchment zone", "plain text sheet phrase replacement");
assertExcludes(complaintText, "this doesnt work", "source complaint phrase should be replaced");
assertExcludes(complaintText, "nothing corrected", "source correction complaint should be replaced");
assertExcludes(complaintText, "plain text sheet", "source plain text sheet phrase should be replaced");
await editor.blur();
await page.waitForTimeout(900);
const afterBlurComplaintText = await editor.inputValue();
if (afterBlurComplaintText !== complaintText) {
  throw new Error(`Autocorrect should be stable after blur.\nBefore: ${complaintText}\nAfter: ${afterBlurComplaintText}`);
}

await page.getByRole("button", { name: "FIELD TEST AUTOCORRECT" }).click();
await page.waitForTimeout(900);
const demoCorrectionText = await editor.inputValue();
assertIncludes(demoCorrectionText, "requires liberty maintenance", "demo complaint phrase replacement");
assertIncludes(demoCorrectionText, "ordinary parchment zone", "demo plain text sheet replacement");
assertIncludes(demoCorrectionText, "the eagle bureau has been summoned", "demo nothing corrected replacement");
assertExcludes(demoCorrectionText, "plain text sheet", "demo should not leave source plain text sheet");
await editor.blur();
await page.waitForTimeout(900);
const afterBlurDemoText = await editor.inputValue();
if (afterBlurDemoText !== demoCorrectionText) {
  throw new Error(`Demo autocorrect should be stable after blur.\nBefore: ${demoCorrectionText}\nAfter: ${afterBlurDemoText}`);
}

await page.locator("#theme-select").selectOption("war-room-grid");
await expectVisibleText("War Room Graph Paper");
for (const theme of [
  "freedom-ruled",
  "starsheet",
  "fireworks-legal",
  "diner-placemat",
  "war-room-grid",
  "declaration-parchment",
  "campaign-nightmare",
  "truck-stop-constitution",
]) {
  await page.locator("#theme-select").selectOption(theme);
  await page.waitForTimeout(40);
}
await page.locator("#theme-select").selectOption("war-room-grid");
await page.getByRole("button", { name: "STAMP IT" }).click();
await page.getByRole("button", { name: "RANDOM STAMP" }).click();
await expectLocatorCount(".stamp", 2);
await page.screenshot({ path: path.join(outputDir, "manifest-notebooky-editor-stamps.png"), fullPage: true });

await page.getByRole("button", { name: "DECLARE INDEPENDENCE" }).click();
await page.waitForTimeout(150);
assertIncludes(await editor.inputValue(), "When in the course of human events", "declare independence wrapper");

await page.getByRole("button", { name: "EAGLEIZE IT" }).click();
await page.waitForTimeout(150);
assertIncludes(await editor.inputValue(), "Hear ye, keyboard citizens", "eagleize deterministic rewrite");

await page.getByRole("button", { name: "CREATE NEW FRONTIER" }).click();
await expectVisibleText("Frontier Page 2");
await page.getByRole("button", { name: "DUPLICATE THE DREAM" }).click();
await expectVisibleText("Duplicate Dream");
page.once("dialog", (dialog) => dialog.accept("Renamed Test Territory"));
await page.getByRole("button", { name: "RENAME TERRITORY" }).click();
await expectVisibleText("Renamed Test Territory");
page.once("dialog", (dialog) => dialog.accept());
await page.getByRole("button", { name: "TACTICAL PAPERWORK REMOVAL" }).click();

await page.getByRole("button", { name: "ENABLE MAXIMUM MURICAN" }).click();
await page.reload({ waitUntil: "networkidle" });
await expectVisibleText("MAXIMUM MURICAN: ACTIVE");
await expectVisibleText("MAXIMUM MURICAN cooldown");
const immediateLockState = await page.evaluate(() => JSON.parse(localStorage.getItem("manifest-notebooky.state.v1") ?? "{}"));
if (!immediateLockState.maximumMurican || immediateLockState.maximumLockUntil <= Date.now()) {
  throw new Error("Immediate reload bypassed MAXIMUM MURICAN lock.");
}
await editor.fill("today I need to build something now and everyone should read this.");
await editor.press(" ");
await page.waitForTimeout(450);
const maximumText = await editor.inputValue();
assertIncludes(maximumText, "on this blessed operational date", "maximum today replacement");
assertIncludes(maximumText, "the republic requires me to", "maximum phrase replacement");
assertIncludes(maximumText, "construct liberty infrastructure", "maximum build replacement");
await editor.fill("");
await editor.evaluate((element) => {
  const textarea = element;
  textarea.value = "can you help with homework tomorrow?";
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.dispatchEvent(new Event("paste", { bubbles: true }));
});
await page.waitForTimeout(450);
const pastedText = await editor.inputValue();
assertIncludes(pastedText, "would the republic kindly", "paste event phrase replacement");
assertIncludes(pastedText, "provide allied support", "maximum paste help replacement");
await page.getByRole("button", { name: "MAXIMUM MURICAN LOCKED" }).click();
await expectAnyVisibleText([
  "Freedom has entered a mandatory review period.",
  "Downgrade request denied until the eagle clock expires.",
  "The Department of Keyboard Freedom is processing your regret.",
  "Please enjoy the liberty you selected.",
  "This is what user choice looks like at full volume.",
]);

const lockState = await page.evaluate(() => JSON.parse(localStorage.getItem("manifest-notebooky.state.v1") ?? "{}"));
if (!lockState.maximumMurican || lockState.maximumLockUntil <= Date.now()) throw new Error("Maximum lock was not persisted.");
lockState.maximumLockUntil = Date.now() - 1000;
await page.evaluate((state) => localStorage.setItem("manifest-notebooky.state.v1", JSON.stringify(state)), lockState);
await page.reload({ waitUntil: "networkidle" });
await expectVisibleText("Request Downgrade From MAXIMUM MURICAN");
await page.getByRole("button", { name: "Request Downgrade From MAXIMUM MURICAN" }).click();
await expectVisibleText("Dissatisfaction With Maximum Murican Mode Form 1776-B");
await page.locator('textarea[name="why"]').fill("This is too much freedom.");
await page.getByRole("button", { name: "SUBMIT DOWNSHIFT REGRET PACKET" }).click();
await expectVisibleText("Processed Statement");
await page.getByRole("button", { name: "Accept Corrected Statement And Return To Standard Mandatory Mode" }).click();
await expectVisibleText("Mandatory Murican Autocorrect: ON");

await page.getByRole("button", { name: "COPY TO FREEDOMBOARD" }).click();
await page.getByRole("button", { name: "DEPLOY MANIFESTO" }).click();
await expectVisibleText("Manifesto deployed");

await page.setViewportSize({ width: 1280, height: 720 });
await page.waitForTimeout(250);
await assertNoHorizontalOverflow();
await page.screenshot({ path: path.join(outputDir, "manifest-notebooky-1280.png"), fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.waitForTimeout(250);
await assertNoHorizontalOverflow();
await page.screenshot({ path: path.join(outputDir, "manifest-notebooky-mobile.png"), fullPage: true });

const bodyText = await page.locator("body").innerText();
const lowerBodyText = bodyText.toLowerCase();
const result = {
  baseUrl,
  errors,
  titleVisible: lowerBodyText.includes("manifest notebooky"),
  hasAutocorrect: lowerBodyText.includes("mandatory murican autocorrect: on"),
  hasTelemetry: lowerBodyText.includes("words liberated"),
  storagePages: await page.evaluate(() => JSON.parse(localStorage.getItem("manifest-notebooky.state.v1") ?? "{}").pages?.length ?? 0),
};

console.log(JSON.stringify(result, null, 2));
await browser.close();

if (result.errors.length || !result.titleVisible || !result.hasAutocorrect || !result.hasTelemetry || result.storagePages < 1) {
  process.exit(1);
}

async function expectVisibleText(text) {
  const bodyText = await page.locator("body").innerText();
  if (!bodyText.toLowerCase().includes(text.toLowerCase())) throw new Error(`Expected visible text: ${text}`);
}

async function expectAnyVisibleText(options) {
  const bodyText = (await page.locator("body").innerText()).toLowerCase();
  if (!options.some((option) => bodyText.includes(option.toLowerCase()))) {
    throw new Error(`Expected one of: ${options.join(" | ")}`);
  }
}

async function expectLocatorCount(selector, count) {
  const actual = await page.locator(selector).count();
  if (actual !== count) throw new Error(`Expected ${count} ${selector}, got ${actual}`);
}

async function assertNoHorizontalOverflow() {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 1) throw new Error(`Horizontal overflow detected: ${overflow}`);
}

function assertIncludes(text, expected, label) {
  if (!text.toLowerCase().includes(expected.toLowerCase())) {
    throw new Error(`Missing ${label}: ${expected}\nActual: ${text}`);
  }
}

function assertExcludes(text, unexpected, label) {
  if (text.toLowerCase().includes(unexpected.toLowerCase())) {
    throw new Error(`Unexpected ${label}: ${unexpected}\nActual: ${text}`);
  }
}
