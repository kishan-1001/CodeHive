
export interface ResourceItem {
    name: string;
    path: string;
}

export interface ResourceCategory {
    id: string; // e.g., 'cpp', 'python'
    name: string;
    icon: string; // Emoji for now, could be Lucide icon name if mapped
    count: number;
    color: string;
    bg: string;
    border: string;
    resources?: ResourceItem[];
}

export const languages: ResourceCategory[] = [
    { name: 'Python', id: 'python', icon: '🐍', count: 12, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
    {
        name: 'Java',
        id: 'java',
        icon: '☕',
        count: 94,
        color: 'text-orange-400',
        bg: 'bg-orange-400/10',
        border: 'border-orange-400/20',
        resources: [
            {
                name: "Java 01",
                path: "/resources/language/java/java 01.pdf"
            },
            {
                name: "Java 02",
                path: "/resources/language/java/java 02.pdf"
            },
            {
                name: "Java 03",
                path: "/resources/language/java/java 03.pdf"
            },
            {
                name: "Java 04",
                path: "/resources/language/java/java 04.pdf"
            },
            {
                name: "Java 05",
                path: "/resources/language/java/java 05.pdf"
            },
            {
                name: "Java 06",
                path: "/resources/language/java/java 06.pdf"
            },
            {
                name: "Java 07",
                path: "/resources/language/java/java 07.pdf"
            },
            {
                name: "Java 08",
                path: "/resources/language/java/java 08.pdf"
            },
            {
                name: "Java 09",
                path: "/resources/language/java/java 09.pdf"
            },
            {
                name: "Java 10",
                path: "/resources/language/java/java 10.pdf"
            },
            {
                name: "Java 11",
                path: "/resources/language/java/java 11.pdf"
            },
            {
                name: "Java 12",
                path: "/resources/language/java/java 12.pdf"
            },
            {
                name: "Java 13",
                path: "/resources/language/java/java 13.pdf"
            },
            {
                name: "Java 14",
                path: "/resources/language/java/java 14.pdf"
            },
            {
                name: "Java 15",
                path: "/resources/language/java/java 15.pdf"
            },
            {
                name: "Java 16",
                path: "/resources/language/java/java 16.pdf"
            },
            {
                name: "Java 17",
                path: "/resources/language/java/java 17.pdf"
            },
            {
                name: "Java 18",
                path: "/resources/language/java/java 18.pdf"
            },
            {
                name: "Java 19",
                path: "/resources/language/java/java 19.pdf"
            },
            {
                name: "Java 20",
                path: "/resources/language/java/java 20.pdf"
            },
            {
                name: "Java 21",
                path: "/resources/language/java/java 21.pdf"
            },
            {
                name: "Java 22",
                path: "/resources/language/java/java 22.pdf"
            },
            {
                name: "Java 23",
                path: "/resources/language/java/java 23.pdf"
            },
            {
                name: "Java 24",
                path: "/resources/language/java/java 24.pdf"
            },
            {
                name: "Java 25",
                path: "/resources/language/java/java 25.pdf"
            },
            {
                name: "Java 26",
                path: "/resources/language/java/java 26.pdf"
            },
            {
                name: "Java 27",
                path: "/resources/language/java/java 27.pdf"
            },
            {
                name: "Java 28",
                path: "/resources/language/java/java 28.pdf"
            },
            {
                name: "Java 29",
                path: "/resources/language/java/java 29.pdf"
            },
            {
                name: "Java 30",
                path: "/resources/language/java/java 30.pdf"
            },
            {
                name: "Java 31",
                path: "/resources/language/java/java 31.pdf"
            },
            {
                name: "Java 32",
                path: "/resources/language/java/java 32.pdf"
            },
            {
                name: "Java 33",
                path: "/resources/language/java/java 33.pdf"
            },
            {
                name: "Java 34",
                path: "/resources/language/java/java 34.pdf"
            },
            {
                name: "Java 35",
                path: "/resources/language/java/java 35.pdf"
            },
            {
                name: "Java 36",
                path: "/resources/language/java/java 36.pdf"
            },
            {
                name: "Java 37",
                path: "/resources/language/java/java 37.pdf"
            },
            {
                name: "Java 38",
                path: "/resources/language/java/java 38.pdf"
            },
            {
                name: "Java 39",
                path: "/resources/language/java/java 39.pdf"
            },
            {
                name: "Java 40",
                path: "/resources/language/java/java 40.pdf"
            },
            {
                name: "Java 41",
                path: "/resources/language/java/java 41.pdf"
            },
            {
                name: "Java 42",
                path: "/resources/language/java/java 42.pdf"
            },
            {
                name: "Java 43",
                path: "/resources/language/java/java 43.pdf"
            },
            {
                name: "Java 44",
                path: "/resources/language/java/java 44.pdf"
            },
            {
                name: "Java 45",
                path: "/resources/language/java/java 45.pdf"
            },
            {
                name: "Java 46",
                path: "/resources/language/java/java 46.pdf"
            },
            {
                name: "Java 47",
                path: "/resources/language/java/java 47.pdf"
            },
            {
                name: "Java 48",
                path: "/resources/language/java/java 48.pdf"
            },
            {
                name: "Java 49",
                path: "/resources/language/java/java 49.pdf"
            },
            {
                name: "Java 50",
                path: "/resources/language/java/java 50.pdf"
            },
            {
                name: "Java 51",
                path: "/resources/language/java/java 51.pdf"
            },
            {
                name: "Java 52",
                path: "/resources/language/java/java 52.pdf"
            },
            {
                name: "Java 53",
                path: "/resources/language/java/java 53.pdf"
            },
            {
                name: "Java 54",
                path: "/resources/language/java/java 54.pdf"
            },
            {
                name: "Java 55",
                path: "/resources/language/java/java 55.pdf"
            },
            {
                name: "Java 56",
                path: "/resources/language/java/java 56.pdf"
            },
            {
                name: "Java 57",
                path: "/resources/language/java/java 57.pdf"
            },
            {
                name: "Java 58",
                path: "/resources/language/java/java 58.pdf"
            },
            {
                name: "Java 59",
                path: "/resources/language/java/java 59.pdf"
            },
            {
                name: "Java 60",
                path: "/resources/language/java/java 60.pdf"
            },
            {
                name: "Java 61",
                path: "/resources/language/java/java 61.pdf"
            },
            {
                name: "Java 62",
                path: "/resources/language/java/java 62.pdf"
            },
            {
                name: "Java 63",
                path: "/resources/language/java/java 63.pdf"
            },
            {
                name: "Java 64",
                path: "/resources/language/java/java 64.pdf"
            },
            {
                name: "Java 65",
                path: "/resources/language/java/java 65.pdf"
            },
            {
                name: "Java 66",
                path: "/resources/language/java/java 66.pdf"
            },
            {
                name: "Java 67",
                path: "/resources/language/java/java 67.pdf"
            },
            {
                name: "Java 68",
                path: "/resources/language/java/java 68.pdf"
            },
            {
                name: "Java 69",
                path: "/resources/language/java/java 69.pdf"
            },
            {
                name: "Java 70",
                path: "/resources/language/java/java 70.pdf"
            },
            {
                name: "Java 71",
                path: "/resources/language/java/java 71.pdf"
            },
            {
                name: "Java 72",
                path: "/resources/language/java/java 72.pdf"
            },
            {
                name: "Java 73",
                path: "/resources/language/java/java 73.pdf"
            },
            {
                name: "Java 74",
                path: "/resources/language/java/java 74.pdf"
            },
            {
                name: "Java 75",
                path: "/resources/language/java/java 75.pdf"
            },
            {
                name: "Java 76",
                path: "/resources/language/java/java 76.pdf"
            },
            {
                name: "Java 77",
                path: "/resources/language/java/java 77.pdf"
            },
            {
                name: "Java 78",
                path: "/resources/language/java/java 78.pdf"
            },
            {
                name: "Java 79",
                path: "/resources/language/java/java 79.pdf"
            },
            {
                name: "Java 80",
                path: "/resources/language/java/java 80.pdf"
            },
            {
                name: "Java 81",
                path: "/resources/language/java/java 81.pdf"
            },
            {
                name: "Java 82",
                path: "/resources/language/java/java 82.pdf"
            },
            {
                name: "Java 83",
                path: "/resources/language/java/java 83.pdf"
            },
            {
                name: "Java 84",
                path: "/resources/language/java/java 84.pdf"
            },
            {
                name: "Java 85",
                path: "/resources/language/java/java 85.pdf"
            },
            {
                name: "Java 86",
                path: "/resources/language/java/java 86.pdf"
            },
            {
                name: "Java 87",
                path: "/resources/language/java/java 87.pdf"
            },
            {
                name: "Java 88",
                path: "/resources/language/java/java 88.pdf"
            },
            {
                name: "Java 89",
                path: "/resources/language/java/java 89.pdf"
            },
            {
                name: "Java 90",
                path: "/resources/language/java/java 90.pdf"
            },
            {
                name: "Java 91",
                path: "/resources/language/java/java 91.pdf"
            },
            {
                name: "Java 92",
                path: "/resources/language/java/java 92.pdf"
            },
            {
                name: "Java 93",
                path: "/resources/language/java/java 93.pdf"
            },
            {
                name: "Java 94",
                path: "/resources/language/java/java 94.pdf"
            }
        ]
    },
    {
        name: 'C++',
        id: 'cpp',
        icon: '⚙️',
        count: 55,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        resources: [
            {
                name: "cpp01",
                path: "/resources/language/cpp/cpp01.pdf"
            },
            {
                name: "cpp02",
                path: "/resources/language/cpp/cpp02.pdf"
            },
            {
                name: "cpp03",
                path: "/resources/language/cpp/cpp03.pdf"
            },
            {
                name: "cpp04",
                path: "/resources/language/cpp/cpp04.pdf"
            },
            {
                name: "cpp05",
                path: "/resources/language/cpp/cpp05.pdf"
            },
            {
                name: "cpp06",
                path: "/resources/language/cpp/cpp06.pdf"
            },
            {
                name: "cpp07",
                path: "/resources/language/cpp/cpp07.pdf"
            },
            {
                name: "cpp08",
                path: "/resources/language/cpp/cpp08.pdf"
            },
            {
                name: "cpp09",
                path: "/resources/language/cpp/cpp09.pdf"
            },
            {
                name: "cpp10",
                path: "/resources/language/cpp/cpp10.pdf"
            },
            {
                name: "cpp11",
                path: "/resources/language/cpp/cpp11.pdf"
            },
            {
                name: "cpp12",
                path: "/resources/language/cpp/cpp12.pdf"
            },
            {
                name: "cpp13",
                path: "/resources/language/cpp/cpp13.pdf"
            },
            {
                name: "cpp14",
                path: "/resources/language/cpp/cpp14.pdf"
            },
            {
                name: "cpp15",
                path: "/resources/language/cpp/cpp15.pdf"
            },
            {
                name: "cpp16",
                path: "/resources/language/cpp/cpp16.pdf"
            },
            {
                name: "cpp17",
                path: "/resources/language/cpp/cpp17.pdf"
            },
            {
                name: "cpp18",
                path: "/resources/language/cpp/cpp18.pdf"
            },
            {
                name: "cpp19",
                path: "/resources/language/cpp/cpp19.pdf"
            },
            {
                name: "cpp20",
                path: "/resources/language/cpp/cpp20.pdf"
            },
            {
                name: "cpp21",
                path: "/resources/language/cpp/cpp21.pdf"
            },
            {
                name: "cpp22",
                path: "/resources/language/cpp/cpp22.pdf"
            },
            {
                name: "cpp23",
                path: "/resources/language/cpp/cpp23.pdf"
            },
            {
                name: "cpp24",
                path: "/resources/language/cpp/cpp24.pdf"
            },
            {
                name: "cpp25",
                path: "/resources/language/cpp/cpp25.pdf"
            },
            {
                name: "cpp26",
                path: "/resources/language/cpp/cpp26.pdf"
            },
            {
                name: "cpp27",
                path: "/resources/language/cpp/cpp27.pdf"
            },
            {
                name: "cpp28",
                path: "/resources/language/cpp/cpp28.pdf"
            },
            {
                name: "cpp29",
                path: "/resources/language/cpp/cpp29.pdf"
            },
            {
                name: "cpp30",
                path: "/resources/language/cpp/cpp30.pdf"
            },
            {
                name: "cpp31",
                path: "/resources/language/cpp/cpp31.pdf"
            },
            {
                name: "cpp32",
                path: "/resources/language/cpp/cpp32.pdf"
            },
            {
                name: "cpp33",
                path: "/resources/language/cpp/cpp33.pdf"
            },
            {
                name: "cpp34",
                path: "/resources/language/cpp/cpp34.pdf"
            },
            {
                name: "cpp35",
                path: "/resources/language/cpp/cpp35.pdf"
            },
            {
                name: "cpp36",
                path: "/resources/language/cpp/cpp36.pdf"
            },
            {
                name: "cpp37",
                path: "/resources/language/cpp/cpp37.pdf"
            },
            {
                name: "cpp38",
                path: "/resources/language/cpp/cpp38.pdf"
            },
            {
                name: "cpp39",
                path: "/resources/language/cpp/cpp39.pdf"
            },
            {
                name: "cpp40",
                path: "/resources/language/cpp/cpp40.pdf"
            },
            {
                name: "cpp41",
                path: "/resources/language/cpp/cpp41.pdf"
            },
            {
                name: "cpp42",
                path: "/resources/language/cpp/cpp42.pdf"
            },
            {
                name: "cpp43",
                path: "/resources/language/cpp/cpp43.pdf"
            },
            {
                name: "cpp44",
                path: "/resources/language/cpp/cpp44.pdf"
            },
            {
                name: "cpp45",
                path: "/resources/language/cpp/cpp45.pdf"
            },
            {
                name: "cpp46",
                path: "/resources/language/cpp/cpp46.pdf"
            },
            {
                name: "cpp47",
                path: "/resources/language/cpp/cpp47.pdf"
            },
            {
                name: "cpp48",
                path: "/resources/language/cpp/cpp48.pdf"
            },
            {
                name: "cpp49",
                path: "/resources/language/cpp/cpp49.pdf"
            },
            {
                name: "cpp50",
                path: "/resources/language/cpp/cpp50.pdf"
            },
            {
                name: "cpp51",
                path: "/resources/language/cpp/cpp51.pdf"
            },
            {
                name: "cpp52",
                path: "/resources/language/cpp/cpp52.pdf"
            },
            {
                name: "cpp53",
                path: "/resources/language/cpp/cpp53.pdf"
            },
            {
                name: "cpp54",
                path: "/resources/language/cpp/cpp54.pdf"
            },
            {
                name: "cpp55",
                path: "/resources/language/cpp/cpp55.pdf"
            }
        ]
    },
    { name: 'C', id: 'c', icon: '©️', count: 0, color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
    { name: 'JavaScript', id: 'javascript', icon: '📜', count: 20, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },

];

export const topics: ResourceCategory[] = [
    { name: 'Data Structures', id: 'dsa', icon: '🏗️', count: 25, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
    { name: 'Algorithms', id: 'algorithms', icon: '🧮', count: 30, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
    { name: 'System Design', id: 'system-design', icon: '📐', count: 10, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' },
    { name: 'Database', id: 'database', icon: '💾', count: 15, color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/20' },
    { name: 'Operating Systems', id: 'os', icon: '💻', count: 8, color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' },
    { name: 'Computer Networks', id: 'networks', icon: '🌐', count: 12, color: 'text-teal-400', bg: 'bg-teal-400/10', border: 'border-teal-400/20' },
];
