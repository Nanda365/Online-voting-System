import Thumbnail1 from './assets/state.jpg'
import Thumbnail2 from './assets/parliament.jpeg';
import Candidate1 from './assets/candidate1.jpg'
import Candidate2 from './assets/candidate2.png'
import Candidate3 from './assets/candidate3.png'


export const elections = [
    {
        id: "e1",
        title: "Telangana State Elections 2025",
        description: "Telangana, India's 29th state, was formed on June 2, 2014, with Hyderabad as its capital. It is known for its rich history, cultural heritage, and economic growth, especially in IT, agriculture, and pharmaceuticals. The Godavari and Krishna rivers are vital for irrigation.",
        thumbnail: Thumbnail1,
        candidates: ["c1","c2","c3"],
        voters: []
    },
    {
        id: "e2",
        title: "Parliamentary Elections 2025",
        description: "Telangana elects Members of Parliament (MPs) to the Lok Sabha, the lower house of India's Parliament. These elections are held every five years, with candidates elected directly by the state's voters.",
        thumbnail: Thumbnail2,
        candidates: ["c1","c2","c3"],
        voters: []
    },
]

export const candidates = [
    {
        id: "c1",
        fullName: "TRS",
        image: Candidate1,
        motto: ' "Neellu, Nidhulu, Niayamakalu" (Water, Funds, Jobs).',
        voteCount: 23,
        election: "e1",
    },
    {
        id: "c2",
        fullName: "Congress",
        image: Candidate2,
        motto: '"Garibi Hatao, Desh Bachao" (Remove Poverty, Save the Nation).',
        voteCount: 18,
        election: "e1",
    },
    {
        id: "c3",
        fullName: "BJP",
        image: Candidate3,
        motto: '"Sabka Saath, Sabka Vikas, Sabka Vishwas"(Together with all, Development for all, Trust of all).',
        voteCount: 3,
        election: "e1",
    }
]


export const voters = [
    {
        id: "v1",
        fullName: "nanda",
        email: "nanda@gmail.com",
        password: "nanda123",
        isAdmin: true,
        votedElections: ["e1"]
    },
    {
        id: "v2",
        fullName: "abhiram",
        email: "abhi@gmail.com",
        password: "abhi123",
        isAdmin: false,
        votedElections: ["e1"]
    },
    {
        id: "v3",
        fullName: "manohar",
        email: "manohar@gmail.com",
        password: "manohar123",
        isAdmin: false,
        votedElections: ["e1"]
    }
]