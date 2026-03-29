/**
 * Returns a context-aware loading message based on the user's input.
 * Cycles through messages for the same context on repeated calls.
 */

const contextPatterns = [
  {
    match: /\b(photo|image|picture|upload|attached|\.jpg|\.png)\b/i,
    messages: [
      "Looking at your photo...",
      "Analyzing the image...",
      "Let me see what's in the picture...",
      "Scanning your photo...",
    ],
  },
  {
    match: /\b(bought|shopping|grocery|picked up|got|store)\b/i,
    messages: [
      "Updating your kitchen inventory...",
      "Sorting through your haul...",
      "Stocking the shelves...",
      "Checking what's new in the kitchen...",
    ],
  },
  {
    match: /\b(what should|what to (eat|cook|make)|suggest|recommend|dinner|lunch|breakfast)\b/i,
    messages: [
      "Checking what's in your kitchen...",
      "Browsing through recipe ideas...",
      "Thinking about what sounds good...",
      "Matching ingredients to recipes...",
    ],
  },
  {
    match: /\b(recipe|how to (cook|make|prepare)|instructions|ingredients)\b/i,
    messages: [
      "Looking up the recipe...",
      "Gathering ingredients and steps...",
      "Finding the best version of this dish...",
    ],
  },
  {
    match: /\b(remind|reminder|defrost|thaw|prep|prepare ahead)\b/i,
    messages: [
      "Setting that up for you...",
      "Adding to your reminders...",
      "Making a note of that...",
    ],
  },
  {
    match: /\b(expir|going bad|use up|running out|shelf life)\b/i,
    messages: [
      "Checking your expiry dates...",
      "Looking for items to use soon...",
      "Scanning your inventory...",
    ],
  },
  {
    match: /\b(save|keep|favorite|bookmark)\b/i,
    messages: [
      "Saving that to your collection...",
      "Adding to your recipe book...",
    ],
  },
  {
    match: /\b(cook(ed|ing)?|made|log|ate|had for)\b/i,
    messages: [
      "Logging your meal...",
      "Updating your kitchen stock...",
      "Noting what you made...",
    ],
  },
]

const defaultMessages = [
  "Cooking up a reply...",
  "Thinking about that...",
  "Let me figure this out...",
  "Working on it...",
  "One moment...",
]

let lastIndex = 0

export function getLoadingMessage(userMessage) {
  if (!userMessage) return defaultMessages[0]

  for (const { match, messages } of contextPatterns) {
    if (match.test(userMessage)) {
      lastIndex = (lastIndex + 1) % messages.length
      return messages[lastIndex]
    }
  }

  lastIndex = (lastIndex + 1) % defaultMessages.length
  return defaultMessages[lastIndex]
}
