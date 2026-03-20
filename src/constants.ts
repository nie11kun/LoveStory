import { Memory, UserProfile } from './types';

export const INITIAL_PROFILE: UserProfile = {
  name: "子轩",
  partnerName: "雨婷",
  anniversaryDate: "2018-10-14",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBidIwNofOx2r89Dg1gkLNxfUJiNzPhk6czdd1knQhGEqv-U7LU5xHqVAuzUMZaCgScvXgtwBnFkK9QpdGm6l_vpEUXpodbKjZEagPE9SXi9jC-1t_OLZbTn_q0zOJNoEUzVKLTuHx_jjSRxwbOZJq7ISwnjVxIfIR9tCiCvv62fTVXpuJjSm7C8DLEnOEY4yJUdTxwPaELqJiSjgkP6sXpKTN_vPY-mcmyVz0duVDgucPZ4zlhFSymFcEAytb64ER95NFzhPfqHHGg"
};

export const INITIAL_MEMORIES: Memory[] = [
  {
    id: '1',
    title: "初识那一天",
    date: "2019-09-14",
    description: "一个细雨绵绵的午后，在那间转角咖啡馆，一声简单的“你好”拉开了序幕。那时我们还不知道，这就是一切的开始。",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBakobR3Rs7qqu-NN5huM8-mkllIiY5fCSYApivnneerfYPKpeu3z63RXnGCIM35WLLNYGgT8_HbCkAFcvxe9NnDo7Vcih1HXg2geJ_3XcNSWwH45e1T6mxLwlpO5GHREDjAkSxj8eWBLipNZY7Vuecp3DbIFegNQUyyZSMGbWBQ9knVyrIhKvNVN0GziWZnzjA7c499X6ilHD7FSd9SZriPPzeX3AT27fyrTJKsQMekZpvvj_nEif_HZVO4Ky8_7wToK298BNp2Qm6"
    ],
    tags: ["一见钟情", "咖啡时光"],
    category: "Daily",
    daysAgo: 2360
  },
  {
    id: '2',
    title: "第一次共同旅行",
    date: "2021-05-22",
    description: "金色的沙滩和聊不完的话题。我们意识到，只要牵着手，走遍世界每个角落都会更加美好。",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCuyH2kbs3eiXTn8AX4Gg4UDe2zwVgYir4mQUzrv-S0FbvBGIHFoQb5dksAWieXWovSwXb40rq0IkP0dGcx_ZngOM5cpm77uCCmPWmgSzmvGUYhAPmFt8PMdMheVdresiZWx1uss2euUGkSnhG8hCSn3E3I2Km3YQBUkJtRz33Iw0XL6KoRwQFiOAXndnZy8uVnDpP3vvOJDzRw2vZYwK_iV6fL1LpIdXFkg7OLaDPdFPArndw5DTD6QyTj6DLb4T87IuYx0FlREtgM"
    ],
    tags: ["旅行", "日落"],
    category: "Travel",
    daysAgo: 1744
  },
  {
    id: '3',
    title: "求婚时刻",
    date: "2023-12-24",
    description: "“我无法想象没有你的每一天。你愿意嫁给我吗？”在冬夜的星空下，她说了“我愿意”。",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC-BP7p-00dSpb6UZ0c_7tK2XtiOig6ADfNUtTWmIztWz-R4Of1WPXvvjjJYhYR6aNrXJbBN4xzbDUxaQMIMtZAQcBdu7g2jRkRgPye07leoWn73vEyVCv5c8c2lDdfTZH2Rbhfw1KnMo55Qv4SEHhf9wa9JZHmd8Efn5Ncabtm3YMX-6vFTtGA-3Kp6t6cu3APVwldbqJVD4oLEN9jrcttOJuUY6bXv2OEZsyAOAcPqp47ACiKItzH8Ca2AYQX2wMqyR9N23DJBHap"
    ],
    tags: ["纪念日", "求婚"],
    category: "Anniversary",
    daysAgo: 798
  }
];
