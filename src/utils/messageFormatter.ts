/**
 * Message formatting utilities for chatbot responses
 */

export interface FormattedMessage {
  text: string;
  isFormatted: boolean;
  hasLinks: boolean;
  hasList: boolean;
  hasCodeBlocks: boolean;
}

export const messageFormatter = {
  /**
   * Format a message with markdown-like formatting
   * @param message Raw message text
   * @returns Formatted message object
   */
  formatMessage(message: string): FormattedMessage {
    let formattedText = message;
    let hasLinks = false;
    let hasList = false;
    let hasCodeBlocks = false;
    let isFormatted = false;

    // Format bold text (**text** or __text__)
    if (formattedText.includes("**") || formattedText.includes("__")) {
      formattedText = formattedText
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/__(.*?)__/g, "<strong>$1</strong>");
      isFormatted = true;
    }

    // Format italic text (*text* or _text_)
    if (formattedText.includes("*") || formattedText.includes("_")) {
      formattedText = formattedText
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/_(.*?)_/g, "<em>$1</em>");
      isFormatted = true;
    }

    // Format inline code (`code`)
    if (formattedText.includes("`")) {
      formattedText = formattedText.replace(
        /`(.*?)`/g,
        '<code class="inline-code">$1</code>'
      );
      hasCodeBlocks = true;
      isFormatted = true;
    }

    // Format code blocks (```code```)
    if (formattedText.includes("```")) {
      formattedText = formattedText.replace(
        /```([\s\S]*?)```/g,
        '<pre class="code-block">$1</pre>'
      );
      hasCodeBlocks = true;
      isFormatted = true;
    }

    // Format links [text](url)
    if (formattedText.includes("[") && formattedText.includes("](")) {
      formattedText = formattedText.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="message-link">$1</a>'
      );
      hasLinks = true;
      isFormatted = true;
    }

    // Format bullet points (- item or * item)
    if (formattedText.includes("\n- ") || formattedText.includes("\n* ")) {
      formattedText = formattedText
        .replace(/\n- (.*)/g, "\n• $1")
        .replace(/\n\* (.*)/g, "\n• $1");
      hasList = true;
      isFormatted = true;
    }

    // Format numbered lists (1. item)
    if (/\n\d+\. /.test(formattedText)) {
      hasList = true;
      isFormatted = true;
    }

    // Format line breaks
    formattedText = formattedText.replace(/\n/g, "<br>");

    return {
      text: formattedText,
      isFormatted,
      hasLinks,
      hasList,
      hasCodeBlocks,
    };
  },

  /**
   * Sanitize HTML content to prevent XSS attacks
   * @param html HTML string to sanitize
   * @returns Sanitized HTML string
   */
  sanitizeHTML(html: string): string {
    // Basic HTML sanitization - remove dangerous tags and attributes
    const dangerousTags = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    const dangerousAttributes = /on\w+\s*=\s*"[^"]*"/gi;

    return html.replace(dangerousTags, "").replace(dangerousAttributes, "");
  },

  /**
   * Extract plain text from formatted message for search/indexing
   * @param formattedMessage Formatted message object
   * @returns Plain text content
   */
  extractPlainText(formattedMessage: FormattedMessage): string {
    return formattedMessage.text
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/&[^;]+;/g, " ") // Remove HTML entities
      .trim();
  },

  /**
   * Detect if message contains specific blood donation keywords
   * @param message Message text to analyze
   * @returns Object with detected keywords and categories
   */
  analyzeContent(message: string): {
    categories: string[];
    keywords: string[];
    isBloodDonationRelated: boolean;
  } {
    const bloodDonationKeywords = [
      "blood donation",
      "donate blood",
      "blood drive",
      "blood bank",
      "hemoglobin",
      "iron deficiency",
      "eligibility",
      "donation process",
      "blood type",
      "screening",
      "health requirements",
      "recovery time",
      "platelet",
      "plasma",
      "red blood cells",
      "transfusion",
    ];

    const healthKeywords = [
      "health",
      "medical",
      "symptoms",
      "condition",
      "treatment",
      "medication",
      "doctor",
      "hospital",
      "clinic",
    ];

    const processKeywords = [
      "how to",
      "process",
      "procedure",
      "steps",
      "requirements",
      "eligibility",
      "criteria",
      "guidelines",
    ];

    const lowerMessage = message.toLowerCase();
    const foundKeywords: string[] = [];
    const categories: string[] = [];

    // Check blood donation keywords
    const bloodKeywords = bloodDonationKeywords.filter((keyword) =>
      lowerMessage.includes(keyword.toLowerCase())
    );
    if (bloodKeywords.length > 0) {
      foundKeywords.push(...bloodKeywords);
      categories.push("blood-donation");
    }

    // Check health keywords
    const healthMatches = healthKeywords.filter((keyword) =>
      lowerMessage.includes(keyword.toLowerCase())
    );
    if (healthMatches.length > 0) {
      foundKeywords.push(...healthMatches);
      categories.push("health");
    }

    // Check process keywords
    const processMatches = processKeywords.filter((keyword) =>
      lowerMessage.includes(keyword.toLowerCase())
    );
    if (processMatches.length > 0) {
      foundKeywords.push(...processMatches);
      categories.push("process");
    }

    return {
      categories,
      keywords: foundKeywords,
      isBloodDonationRelated:
        categories.includes("blood-donation") || foundKeywords.length > 0,
    };
  },
};
