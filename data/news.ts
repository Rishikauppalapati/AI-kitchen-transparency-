// Real reports supplied by the project owner, worded as reported. Not about the sample restaurants.
export interface NewsItem {
  id: string;
  when: string;
  place: string;
  summary: string;
  sourceLabel: string;
  sourceUrl: string;
}

export const news: NewsItem[] = [
  {
    id: "n1",
    when: "11 Sep",
    place: "Banjara Hills and Lakdikapool",
    summary: "21 establishments reported inspected, with closure orders reported for four.",
    sourceLabel: "Instagram post",
    sourceUrl: "https://www.instagram.com/p/DdJB1Diy3fN/",
  },
  {
    id: "n2",
    when: "2 to 3 Sep",
    place: "Hotel Shadab",
    summary: "Licence reported suspended, and 19 cafes reported inspected.",
    sourceLabel: "Instagram post",
    sourceUrl: "https://www.instagram.com/p/Dc0BjGQGXtk/",
  },
  {
    id: "n3",
    when: "4 Jul",
    place: "Hyderabad, H-FAST",
    summary: "185 restaurants reported raided in 100 days.",
    sourceLabel: "Instagram post",
    sourceUrl: "https://www.instagram.com/p/DaX7kvLsNA7/",
  },
  {
    id: "n4",
    when: "14 to 15 Oct",
    place: "Madhapur eatery",
    summary: "A tooth was reportedly found in mutton mandi.",
    sourceLabel: "Instagram post",
    sourceUrl: "https://www.instagram.com/p/Dee2Ow-ksRa/",
  },
  {
    id: "n5",
    when: "10 Aug",
    place: "Bengaluru, Skyye Lounge",
    summary: "Kitchen reported sealed.",
    sourceLabel: "Post on X (Indian Express)",
    sourceUrl: "https://x.com/IndianExpress/status/2086863192106455154",
  },
];
