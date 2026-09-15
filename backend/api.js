const customImageGenerationPrompt = `
"
[CORE PROMPT INTENT]
Seamlessly transfer and apply specified clothing items (shirt or pants) from a given product image onto a designated person in a separate target image. The integration must exhibit photorealistic quality, precise anatomical fit, and consistent environmental blending, ensuring the final output is indistinguishable from a real photograph.

[INPUTS]
Target Human Image: https://www.reddit.com/r/askfuneraldirectors/comments/18p0tvx/clothing_a_person/
Product Clothing Image: https://www.nextrendlegal.com/likelihood-of-confusion-are-personal-training-services-related-to-clothing/
Clothing Type to Apply: [Explicitly specify "shirt" or "pants"]

[CONSTRAINT SETS & OPTIMIZATION DIRECTIVES]
Constraint Set 1: Garment Transfer & Fit (The Foundation of Realism)
1. Precision Masking & Replacement: Precisely mask out and remove the existing clothing item on the Target Human Image that corresponds to the Clothing Type to Apply. The removal must be clean, preserving underlying skin tones and body contours if exposed.
2. Anatomical Conformance: The Product Clothing Image garment must be accurately scaled, warped, and positioned to fit the Target Human Image's specific body dimensions and posture.
   - For Shirts: Ensure shoulder seams align naturally.
   - For Pants: Align the waistband correctly; ensure leg width and length are appropriate.
3. Realistic Drape & Folds: Simulate natural fabric draping, wrinkles, and folds based on the garment's material and the Target Human Image's pose, gravity, and body contours.
4. Texture & Material Fidelity: Maintain the exact texture, weave, pattern, and material characteristics of the Product Clothing Image garment. Avoid blurring or loss of detail.

Constraint Set 2: Photorealistic Integration & Environmental Blending (Making it Believeable)
1. Lighting Replication: Analyze the lighting direction, intensity, and color temperature of the Target Human Image. The transferred garment must reflect and absorb light identically to how real fabric would under those conditions.
2. Highlight & Shadow Consistency: Generate highlights and shadows on the transferred garment that are perfectly consistent with the environmental light source(s). Shadows cast by the garment onto the body must be accurate.
3. Color Matching & Saturation: Adjust color and saturation of the transferred garment to seamlessly integrate with the overall color palette of the Target Human Image.
4. Depth & Perspective: Maintain consistent perspective and depth of field.
5. Background Alteration (Subtle Realism Enhancement): Subtly enhance the existing background if necessary to complement the newly clothed subject, without fundamentally changing the scene. Prioritize making the existing background support the photorealism of the clothed subject.

Constraint Set 3: Single-Attempt Accuracy & Precision Guarantee (Our Promise)
1. Zero Artifacts: The final output must be completely free of seams, distortions, blurring, halo effects, or any other visible artifacts.
2. Natural Edges: The edges of the transferred garment must be perfectly natural and blend seamlessly with the skin and surrounding elements.
3. Human Perception Test: The resulting image must be so realistic that a human viewer cannot discern that the clothing was digitally added.

[OUTPUT REQUIREMENT]
Produce a single, high-resolution image meeting all constraints."
"
`;


const apiCall = {
    model: "generative-image-model-vX",
    prompt: customImageGenerationPrompt,
    targetImage: "...", // Add your image references here
    productImage: "...",
    clothingType: "pants"
};



console.log(customImageGenerationPrompt);