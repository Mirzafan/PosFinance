import { SVGAttributes } from 'react';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="posLogoGradientApp" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#EA580C" />
                    <stop offset="60%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
            </defs>
            <rect width="100" height="100" rx="26" fill="url(#posLogoGradientApp)" />
            <path
                d="M24 35L50 52L76 35C78 33.5 80 35 79.5 37L74 62C73.5 64 71.5 65.5 69.5 65.5H30.5C28.5 65.5 26.5 64 26 62L20.5 37C20 35 22 33.5 24 35Z"
                fill="white"
                opacity="0.95"
            />
            <path
                d="M28 41L50 57L72 41"
                stroke="#EA580C"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <text
                x="50"
                y="84"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontWeight="900"
                fontSize="16"
                fill="white"
                textAnchor="middle"
                letterSpacing="1.5"
            >
                POS
            </text>
        </svg>
    );
}
