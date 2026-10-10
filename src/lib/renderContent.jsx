import React from "react";

// یه پاراگراف از متن رو می‌گیره و لینک‌های [متن](آدرس) رو به <a> واقعی تبدیل می‌کنه
function renderInlineLinks(text, keyPrefix) {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let i = 0;

    while ((match = linkRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        parts.push(
            <a
                key={`${keyPrefix}-link-${i++}`}
                href={match[2]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 underline hover:text-orange-500"
            >
                {match[1]}
            </a>
        );

        lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}

// کل متن مقاله رو به بلوک‌های React (تیتر h1/h2/h3 یا پاراگراف) تبدیل می‌کنه
export function renderContent(content) {
    if (!content) return null;

    const blocks = content.split(/\n\s*\n/);

    return blocks.map((block, idx) => {
        const trimmed = block.trim();

        if (!trimmed) return null;

        if (trimmed.startsWith("### ")) {
            return (
                <h3
                    key={idx}
                    className="text-lg font-semibold text-[#7A6960] mt-6 mb-2"
                >
                    {renderInlineLinks(trimmed.slice(4), idx)}
                </h3>
            );
        }

        if (trimmed.startsWith("## ")) {
            return (
                <h2
                    key={idx}
                    className="text-xl font-semibold text-[#7A6960] mt-8 mb-3"
                >
                    {renderInlineLinks(trimmed.slice(3), idx)}
                </h2>
            );
        }

        if (trimmed.startsWith("# ")) {
            return (
                <h1
                    key={idx}
                    className="text-2xl font-bold text-[#7A6960] mt-8 mb-4"
                >
                    {renderInlineLinks(trimmed.slice(2), idx)}
                </h1>
            );
        }

        return (
            <p
                key={idx}
                className="text-[#7A6960] leading-relaxed mb-4 whitespace-pre-wrap"
            >
                {renderInlineLinks(trimmed, idx)}
            </p>
        );
    });
}