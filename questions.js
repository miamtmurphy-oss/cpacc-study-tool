(function () {
  'use strict';
  var domains = [
    'Disabilities',
    'Accessibility and Universal Design',
    'Standards, Laws, and Management Strategies'
  ];
  var questions = [
    {
      domain: domains[0], prompt: 'A person has limited ability to distinguish certain colors. Which design choice most directly reduces the chance that they will miss an important status?',
      options: ['Use color together with a text label or shape', 'Increase the number of colors in the palette', 'Use a brighter color for the status', 'Place the status only in a legend'],
      answer: 0, explanation: 'Color should not be the only means of conveying information. A text label, icon, or other redundant cue helps people with color-vision differences and benefits many others.'
    },
    {
      domain: domains[0], prompt: 'Which statement best describes the social model of disability?',
      options: ['Disability is located entirely in an individual medical diagnosis', 'Disability arises in part from barriers in society and the environment', 'Disability can be removed only through rehabilitation', 'Disability is the same as a temporary illness'],
      answer: 1, explanation: 'The social model emphasizes that inaccessible environments, attitudes, and systems disable people by creating barriers, rather than locating the whole problem in an individual.'
    },
    {
      domain: domains[0], prompt: 'A developer tests a site using only a mouse. Which access need is most directly overlooked?',
      options: ['People who navigate with a keyboard or switch', 'People who need captions for video', 'People who use screen magnification', 'People who need simplified language'],
      answer: 0, explanation: 'Mouse-only testing misses keyboard access and other keyboard-emulating input methods, such as many switches and alternative keyboards.'
    },
    {
      domain: domains[0], prompt: 'What is a common functional impact of low vision that designers should consider?',
      options: ['Some users enlarge content or adjust contrast and spacing', 'Every user with low vision uses the same screen reader', 'Low vision always prevents color perception', 'Users with low vision cannot use a keyboard'],
      answer: 0, explanation: 'Low vision varies widely. People may zoom, enlarge text, use magnification, or customize contrast; interfaces should remain usable under those settings.'
    },
    {
      domain: domains[0], prompt: 'Which accommodation is most directly helpful to many people who are Deaf or hard of hearing when viewing prerecorded speech?',
      options: ['Synchronized captions', 'A decorative transcript icon', 'Higher playback volume only', 'A longer audio fade-in'],
      answer: 0, explanation: 'Captions present spoken dialogue and relevant non-speech audio in synchronized text. Volume alone does not provide equivalent access.'
    },
    {
      domain: domains[0], prompt: 'Why can a cognitive disability make dense, unpredictable navigation difficult?',
      options: ['It can increase memory, attention, or processing demands', 'It prevents use of all visual interfaces', 'It means text alternatives are not useful', 'It always affects reading in the same way'],
      answer: 0, explanation: 'Some cognitive disabilities affect memory, attention, language, or processing. Clear structure and predictable interactions can reduce avoidable cognitive load.'
    },
    {
      domain: domains[0], prompt: 'Which description of a person with a speech disability is most appropriate when designing a communication service?',
      options: ['Assume they cannot understand spoken language', 'Provide alternatives to voice-only interactions', 'Require a caregiver to speak for them', 'Treat text communication as an exception'],
      answer: 1, explanation: 'Speech disabilities do not imply limited understanding. Providing text, chat, or other non-voice paths avoids making speech a prerequisite.'
    },
    {
      domain: domains[0], prompt: 'A user with limited dexterity needs to activate a small control. Which change can help?',
      options: ['Make the target larger and provide adequate spacing', 'Require a precise double-click', 'Move the control to a hover-only menu', 'Reduce the control label to an icon with no name'],
      answer: 0, explanation: 'Larger, well-spaced targets are easier for people with tremor, limited reach, or alternative pointing devices to activate.'
    },
    {
      domain: domains[0], prompt: 'Which statement about disability and assistive technology is most accurate?',
      options: ['A disability always maps to one specific technology', 'People with the same disability may use different tools or none', 'Assistive technology eliminates every access barrier', 'Only computers qualify as assistive technology'],
      answer: 1, explanation: 'Technology choices are personal and depend on context, preference, and task. Disability labels do not determine a single device or approach.'
    },
    {
      domain: domains[0], prompt: 'What does the term “situational disability” highlight?',
      options: ['Some access barriers arise temporarily from a person’s context', 'Disability is always permanent', 'A person must have a diagnosis to encounter a barrier', 'Only mobile devices create accessibility needs'],
      answer: 0, explanation: 'A temporary context, such as holding a child or being in bright sunlight, can create an access need similar to a permanent impairment.'
    },
    {
      domain: domains[0], prompt: 'Which pairing is an example of a hearing-related access need and a suitable design response?',
      options: ['Unclear audio — provide a transcript or captions', 'Limited dexterity — add autoplay audio', 'Low vision — remove text labels', 'Color blindness — reduce heading structure'],
      answer: 0, explanation: 'Transcripts and captions make audio information available through text, supporting people who are Deaf or hard of hearing and people in noisy settings.'
    },
    {
      domain: domains[0], prompt: 'Why should accessibility teams avoid treating disability categories as uniform?',
      options: ['The same diagnosis can have different effects, preferences, and contexts', 'Categories are useful only for legal compliance', 'Every person uses the same accommodation', 'Disability categories predict technical skill'],
      answer: 0, explanation: 'People are diverse, and the effects of an impairment vary by person, environment, and task. Inclusive design should not rely on stereotypes.'
    },
    {
      domain: domains[0], prompt: 'Which design feature may support a user with dyslexia without being useful only to people with dyslexia?',
      options: ['Clear headings and plain, well-structured language', 'Text embedded only in images', 'Justified paragraphs with tight spacing', 'Long passages in all capitals'],
      answer: 0, explanation: 'Plain language and clear structure can help some people with dyslexia and also improve comprehension and navigation for a broad audience.'
    },
    {
      domain: domains[0], prompt: 'A person cannot hear an audio-only announcement in a public setting. Which principle is most relevant?',
      options: ['Make the information available through another sensory channel', 'Increase the loudness without changing anything else', 'Provide a visual animation with no text', 'Assume nearby people will relay the message'],
      answer: 0, explanation: 'Providing redundant modalities, such as visible text in addition to sound, avoids depending on one sensory channel.'
    },
    {
      domain: domains[0], prompt: 'Which statement best reflects an interaction between a person and an environment?',
      options: ['A barrier can become more or less significant depending on the task and context', 'An inaccessible interface affects every person identically', 'A diagnosis alone determines whether a service is accessible', 'Environmental design cannot affect participation'],
      answer: 0, explanation: 'Accessibility is contextual: a feature, task, or environment can create or remove barriers depending on how a person interacts with it.'
    },
    {
      domain: domains[0], prompt: 'Why can allowing users to pause, stop, or extend a time limit improve access?',
      options: ['It can support people who need more time to read, think, or operate controls', 'It guarantees every person will finish the task', 'It replaces the need for clear instructions', 'It is useful only to people with motor disabilities'],
      answer: 0, explanation: 'Flexible timing can support people with cognitive, visual, motor, or other access needs, as well as anyone interrupted or working under difficult conditions.'
    },
    {
      domain: domains[0], prompt: 'Which practice best supports respectful and accurate disability communication?',
      options: ['Ask people about language preferences and avoid assumptions', 'Use one preferred term for every person', 'Describe people only by a diagnosis', 'Avoid consulting disabled people'],
      answer: 0, explanation: 'Language preferences differ. Ask when appropriate, use respectful language, and involve people with disabilities in decisions that affect them.'
    },
    {
      domain: domains[1], prompt: 'What is the central aim of universal design?',
      options: ['Design products and environments usable by the widest range of people without adaptation where possible', 'Create one separate version for each diagnosis', 'Replace individual accommodations in every case', 'Prioritize aesthetics over usability'],
      answer: 0, explanation: 'Universal design seeks broad usability from the outset. It complements, rather than eliminates, individualized accommodations when needed.'
    },
    {
      domain: domains[1], prompt: 'Which is one of the seven principles of universal design?',
      options: ['Tolerance for error', 'Mandatory uniformity', 'Sensory exclusivity', 'Minimum adaptability'],
      answer: 0, explanation: 'Tolerance for error is a universal design principle: design should minimize hazards and adverse consequences of accidental or unintended actions.'
    },
    {
      domain: domains[1], prompt: 'In the POUR principles, what does “Perceivable” require?',
      options: ['Information and interface components must be presentable to users in ways they can perceive', 'Every action must use a pointer', 'The content must never change', 'All text must be written at one reading level'],
      answer: 0, explanation: 'Perceivable means information cannot be unavailable to all of a user’s senses; alternatives such as text for images or captions for audio help.'
    },
    {
      domain: domains[1], prompt: 'Which change most directly supports the “Operable” principle?',
      options: ['Ensure all functionality is available from a keyboard', 'Add a longer page title', 'Use correct spelling in help text', 'Describe the purpose of a chart'],
      answer: 0, explanation: 'Keyboard operability is a core part of making interface functionality operable without requiring a particular input method.'
    },
    {
      domain: domains[1], prompt: 'What is an example of making an interface “Understandable”?',
      options: ['Use consistent navigation and identify input errors clearly', 'Make every link open in a new window', 'Use only color to mark required fields', 'Change controls unexpectedly after each action'],
      answer: 0, explanation: 'Understandable content and operation are supported by predictable behavior, clear instructions, and helpful error identification.'
    },
    {
      domain: domains[1], prompt: 'What does the “Robust” principle emphasize?',
      options: ['Compatibility with current and future user agents, including assistive technologies', 'Using a single browser for all users', 'Removing semantic markup', 'Designing only for current screen sizes'],
      answer: 0, explanation: 'Robust content should be interpretable by a wide range of user agents, including assistive technologies, now and as technology evolves.'
    },
    {
      domain: domains[1], prompt: 'A decorative photo adds no information to a page. How should it usually be treated for a screen reader?',
      options: ['Use an empty text alternative so it can be ignored', 'Repeat the full page title in its alt text', 'Describe every visual detail', 'Omit the image but add a keyboard trap'],
      answer: 0, explanation: 'Decorative images should generally have a null/empty text alternative so screen readers do not announce irrelevant content.'
    },
    {
      domain: domains[1], prompt: 'A meaningful chart is an image. Which approach best provides an equivalent to people who cannot see it?',
      options: ['Give it a concise text alternative and provide detailed data or explanation nearby', 'Use an empty alternative', 'Name it “chart” and provide no other information', 'Increase its file size'],
      answer: 0, explanation: 'Complex graphics often need a short identifying alternative plus a nearby long description, data table, or equivalent explanation.'
    },
    {
      domain: domains[1], prompt: 'What is the purpose of a skip link near the beginning of a webpage?',
      options: ['Let keyboard users bypass repeated navigation and move to the main content', 'Force screen readers to read the page title twice', 'Hide the main content from assistive technology', 'Make every link open the navigation menu'],
      answer: 0, explanation: 'A skip link is a mechanism to bypass blocks of repeated content, reducing repetitive keyboard navigation.'
    },
    {
      domain: domains[1], prompt: 'Why are visible keyboard focus indicators important?',
      options: ['They show keyboard users which control will receive the next action', 'They replace accessible names', 'They are only helpful at high zoom', 'They prevent assistive technologies from reading controls'],
      answer: 0, explanation: 'A visible focus indicator communicates the current keyboard position and is essential for navigating interactive controls without a pointer.'
    },
    {
      domain: domains[1], prompt: 'Which approach is most appropriate for video containing important spoken information?',
      options: ['Provide accurate captions and, when needed, audio description for essential visual information', 'Provide only a decorative thumbnail', 'Use subtitles in a language users may not understand', 'Remove the audio track'],
      answer: 0, explanation: 'Captions provide access to speech and meaningful sounds; audio description conveys important visual information to people who are blind or have low vision.'
    },
    {
      domain: domains[1], prompt: 'Which is a good practice for heading structure?',
      options: ['Use headings in a logical hierarchy that reflects the content structure', 'Choose heading levels only to get a desired font size', 'Skip heading levels whenever a heading is short', 'Make every paragraph a top-level heading'],
      answer: 0, explanation: 'Semantic, logically nested headings communicate document organization to all readers, including people navigating by headings with assistive technology.'
    },
    {
      domain: domains[1], prompt: 'A form field reports “invalid” but does not indicate which field or how to fix it. What is the key problem?',
      options: ['The error is not identified and described in text with a useful correction', 'The form uses too many labels', 'The form is too compatible with a keyboard', 'The error is visible'],
      answer: 0, explanation: 'Users need to know which input is in error and what is wrong. A clear textual message and correction guidance are important.'
    },
    {
      domain: domains[1], prompt: 'Why should a web page remain usable when text is enlarged?',
      options: ['People with low vision may enlarge text, and content should not be lost or overlap', 'Text enlargement is available only to sighted users', 'Zoom changes never affect layout', 'Enlarged text should always be replaced with images'],
      answer: 0, explanation: 'Users may resize text or zoom to read comfortably. Responsive layouts should preserve content and functionality without clipping or overlap.'
    },
    {
      domain: domains[1], prompt: 'Which description of captions and transcripts is most accurate?',
      options: ['Captions are synchronized with media; transcripts provide a text version that can be read separately', 'Transcripts always include precise timing and captions never do', 'Captions and transcripts are useful only for language learning', 'Neither should include meaningful non-speech sounds'],
      answer: 0, explanation: 'Captions are time-aligned with audio or video; transcripts are separate text equivalents and may offer a convenient way to scan or search content.'
    },
    {
      domain: domains[1], prompt: 'A web page uses native buttons and form controls with meaningful labels. What is a likely benefit?',
      options: ['Built-in semantics and keyboard behavior are exposed to assistive technologies', 'The page no longer needs testing', 'The controls work only with a mouse', 'The controls hide their purpose from browsers'],
      answer: 0, explanation: 'Native semantic HTML provides established behavior and accessibility information, reducing the need to recreate these features with custom code.'
    },
    {
      domain: domains[1], prompt: 'Which design best supports people who are sensitive to motion?',
      options: ['Respect reduced-motion preferences and avoid unnecessary animation', 'Use flashing animation to announce every update', 'Require animations to complete before controls work', 'Provide information only during motion'],
      answer: 0, explanation: 'Some people experience vestibular symptoms or distraction from motion. Reduced motion settings and restrained animation can make content more comfortable.'
    },
    {
      domain: domains[2], prompt: 'What is the role of WCAG?',
      options: ['Provide testable, technology-neutral guidance for making web content more accessible', 'Certify every website as legally compliant', 'Specify one required assistive technology', 'Replace all national accessibility laws'],
      answer: 0, explanation: 'The Web Content Accessibility Guidelines are international recommendations with testable success criteria; they do not by themselves certify sites or replace law.'
    },
    {
      domain: domains[2], prompt: 'What is the difference between a WCAG conformance level and a success criterion?',
      options: ['A success criterion is a testable requirement; levels A, AA, and AAA group conformance requirements', 'A conformance level names a disability; a criterion names a browser', 'A success criterion is optional guidance only', 'They are interchangeable terms for a law'],
      answer: 0, explanation: 'WCAG success criteria are individual testable requirements, while conformance levels organize them into increasing sets of requirements.'
    },
    {
      domain: domains[2], prompt: 'What does WCAG conformance at Level AA generally mean?',
      options: ['All applicable Level A and AA success criteria are met', 'Only the AAA success criteria are met', 'A site has been approved by IAAP', 'Every user can complete every task without assistance'],
      answer: 0, explanation: 'Level AA conformance requires meeting all applicable Level A and Level AA success criteria, subject to WCAG conformance requirements.'
    },
    {
      domain: domains[2], prompt: 'Which statement about the Americans with Disabilities Act (ADA) is most accurate?',
      options: ['It is a United States civil rights law that addresses discrimination based on disability', 'It is a global technical web standard', 'It applies only to government websites', 'It defines the WCAG success criteria'],
      answer: 0, explanation: 'The ADA is a U.S. civil rights statute addressing disability discrimination across covered contexts; it is not a technical content standard.'
    },
    {
      domain: domains[2], prompt: 'What is Section 508 of the Rehabilitation Act most directly associated with?',
      options: ['Accessibility of information and communication technology procured, developed, maintained, or used by U.S. federal agencies', 'A worldwide requirement for all private websites', 'A replacement for the ADA', 'A certification level for web content'],
      answer: 0, explanation: 'Section 508 establishes U.S. federal ICT accessibility requirements for federal agencies and certain procurement contexts.'
    },
    {
      domain: domains[2], prompt: 'What does the UN Convention on the Rights of Persons with Disabilities (CRPD) seek to do?',
      options: ['Promote and protect the human rights and fundamental freedoms of persons with disabilities', 'Set one mandatory color contrast ratio for all websites', 'Create a single global disability benefit program', 'Replace domestic law in every country automatically'],
      answer: 0, explanation: 'The CRPD is an international human rights treaty that affirms the rights and participation of persons with disabilities.'
    },
    {
      domain: domains[2], prompt: 'Which statement about accessibility legislation across countries is sound?',
      options: ['Requirements and enforcement vary by jurisdiction, so local obligations should be assessed', 'A single law applies identically in every country', 'Following WCAG automatically resolves every legal question', 'Only public organizations have accessibility duties'],
      answer: 0, explanation: 'Legal requirements vary by jurisdiction, sector, and context. Technical standards can support compliance but do not replace legal analysis.'
    },
    {
      domain: domains[2], prompt: 'What is a useful first step in organizational accessibility program management?',
      options: ['Establish leadership commitment, goals, roles, and a baseline assessment', 'Wait until every product is complete before assessing it', 'Limit responsibility to one tester', 'Treat accessibility as a one-time redesign'],
      answer: 0, explanation: 'A sustainable program begins with ownership, direction, resources, and an understanding of current barriers and organizational maturity.'
    },
    {
      domain: domains[2], prompt: 'Why include disabled people in user research and usability testing?',
      options: ['Their experience reveals real barriers and helps validate design assumptions', 'It transfers all accessibility responsibility to participants', 'It replaces conformance evaluation', 'It guarantees every disability is represented by one participant'],
      answer: 0, explanation: 'People with disabilities provide essential insight into lived experience. Their participation complements, but does not replace, standards-based evaluation.'
    },
    {
      domain: domains[2], prompt: 'What is the difference between an accessibility audit and ongoing accessibility management?',
      options: ['An audit evaluates a product at a point in time; management embeds practices over the product lifecycle', 'An audit is always automated; management is always manual', 'Management ends when an audit begins', 'They are identical terms for procurement'],
      answer: 0, explanation: 'An audit can identify barriers at a particular time, while a program builds repeatable practices to prevent and remediate them continuously.'
    },
    {
      domain: domains[2], prompt: 'Which statement best describes automated accessibility testing?',
      options: ['It can detect some issues, but cannot determine all accessibility barriers or user experience', 'It proves full accessibility when no errors are reported', 'It replaces keyboard and assistive-technology testing', 'It can judge whether all alternative text is meaningful'],
      answer: 0, explanation: 'Automated tools help identify certain machine-detectable failures. Human inspection and testing with users and assistive technologies are also needed.'
    },
    {
      domain: domains[2], prompt: 'What is an accessibility statement commonly used for?',
      options: ['Describe an organization’s accessibility commitment, known limitations, and contact or feedback route', 'Guarantee that no barriers exist', 'Replace all support channels', 'List only the technologies used to build a site'],
      answer: 0, explanation: 'A useful accessibility statement communicates commitment, scope, known issues, and a way to report barriers or request support.'
    },
    {
      domain: domains[2], prompt: 'Why is accessibility relevant to procurement?',
      options: ['Early requirements can influence vendor selection and reduce barriers before purchase', 'Procurement occurs too early to affect accessibility', 'A vendor contract transfers every legal duty away', 'Only hardware purchases can have access requirements'],
      answer: 0, explanation: 'Including accessibility requirements and evaluation in procurement helps organizations select accessible products and plan remediation before deployment.'
    },
    {
      domain: domains[2], prompt: 'Which practice is most likely to make accessibility sustainable in a product team?',
      options: ['Include accessibility criteria in design, development, quality assurance, and release processes', 'Run one annual training with no follow-up', 'Assign all responsibility to end users', 'Test only after public complaints'],
      answer: 0, explanation: 'Embedding accessibility across the lifecycle and team workflows helps prevent barriers and makes improvements continuous rather than reactive.'
    },
    {
      domain: domains[2], prompt: 'Which is a strong approach to accessibility training?',
      options: ['Provide role-relevant learning and reinforce it with accessible tools, guidance, and review', 'Train only the accessibility specialist', 'Use training instead of accessible design requirements', 'Offer identical content regardless of job responsibilities'],
      answer: 0, explanation: 'Role-based training paired with practical resources and processes equips teams to apply accessibility throughout their work.'
    },
    {
      domain: domains[2], prompt: 'A team discovers an accessibility barrier in a service that is already in use. What is a responsible response?',
      options: ['Prioritize a fix, provide an accessible alternative or support path where possible, and track the issue', 'Wait for the next complete redesign', 'Remove the affected users’ access', 'Close the issue if automated checks pass'],
      answer: 0, explanation: 'Teams should address impact promptly, reduce immediate harm with alternatives or support, and track the remediation through to verification.'
    }
  ];
  window.CPACC_DOMAINS = domains;
  window.CPACC_QUESTIONS = questions;
}());
