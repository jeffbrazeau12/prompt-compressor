// ============================================================
// Example prompts for the Examples tab
// These show before/after compression to help users understand
// what the tool does.
// ============================================================

import type { ExamplePrompt } from '../types';

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    id: 'ex-001',
    title: 'Verbose Technical Request',
    category: 'Technical',
    description: 'A wordy engineering question with filler and politeness overhead.',
    prompt: `Hello! I hope this message finds you well. I was wondering if you could possibly help me to understand, if you have a moment, the fundamental concepts behind how transformer neural networks actually work in practice. I would really appreciate it if you could basically explain the main ideas in a way that is easy to understand. Thank you so much in advance for your time and assistance!`,
  },
  {
    id: 'ex-002',
    title: 'Business Email Draft Request',
    category: 'Business',
    description: 'A request to draft an email, padded with soft openers.',
    prompt: `Hi there! I was hoping you could perhaps kindly help me draft an email to my team. What I am essentially looking for is a brief summary of the fact that our meeting has been moved from Tuesday to Thursday due to the fact that a significant number of team members have conflicts on that particular day. Please make sure that you keep it professional and to the point. Thanks so much!`,
  },
  {
    id: 'ex-003',
    title: 'Code Review Request',
    category: 'Technical',
    description: 'A code review request with redundancy and verbosity.',
    prompt: `I would like you to take into consideration the following code snippet and provide me with a detailed review. In order to be helpful, I would like you to first and foremost identify any potential issues, and then at this point in time provide suggestions for improvement. It is important to note that this code is running in a production environment, so please make absolutely sure that you do not suggest any changes that are not backward-compatible. The code must not break existing API contracts.`,
  },
  {
    id: 'ex-004',
    title: 'Creative Writing Brief',
    category: 'Creative',
    description: 'A creative writing request with excessive hedging.',
    prompt: `I hope I'm not bothering you! I was just wondering if you could possibly write a short story for me, if that's not too much trouble. I'm sort of looking for something that is kind of like a mystery story set in the future, perhaps. I don't really have a strong preference, but it would be really nice if it could be around 500 words or so. Feel free to add your own ideas! Thank you so very much in advance.`,
  },
  {
    id: 'ex-005',
    title: 'Data Analysis Task',
    category: 'Data',
    description: 'A data task with wordy constructions that compress well.',
    prompt: `Good morning! I am writing to ask if you would be willing to help me analyze a dataset. Due to the fact that I have a large number of records to process, I need a Python script that can handle each and every row efficiently. With regards to the output, I need it to not include any rows where the value is null. It is absolutely essential that the script does not modify the original file in any way. Please also make sure that there are no duplicate entries in the final result.`,
  },
  {
    id: 'ex-006',
    title: 'Legal / Constraint-Heavy Prompt',
    category: 'Legal',
    description: 'Demonstrates that negations and constraints are preserved exactly.',
    prompt: `I would like you to please help me draft a clause for a software contract. It is really important that you include language stating that the vendor cannot and must not access user data without explicit written consent. The vendor should never store passwords in plain text, and must not retain any data beyond 30 days after contract termination. The vendor shall not sell, transfer, or disclose data to any third party under any circumstances. These constraints must not be weakened or removed in any revision.`,
  },
  {
    id: 'ex-007',
    title: 'Simple Daily Task',
    category: 'Everyday',
    description: 'A conversational request with typical chat filler.',
    prompt: `Hey! So I was basically wondering if you could sort of help me figure out what I should cook for dinner tonight. I have chicken, pasta, and some vegetables in the fridge. I'd really love something that's fairly simple and doesn't take too long. I'm not really a very experienced cook, so something kind of basic would be great. Oh, and just so you know, I actually don't eat mushrooms.`,
  },
];
