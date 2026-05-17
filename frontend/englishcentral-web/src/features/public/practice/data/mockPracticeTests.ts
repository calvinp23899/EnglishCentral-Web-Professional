export type PracticeSkill = "reading" | "listening" | "writing" | "speaking";

export type PracticeCategory = "ielts" | "toeic" | "general";

export type PracticeQuestionType =
    | "true-false-not-given"
    | "yes-no-not-given"
    | "matching-information"
    | "matching-headings"
    | "matching-features"
    | "matching-sentence-ending"
    | "sentence-completion"
    | "notes-completion"
    | "table-completion"
    | "flowchart-completion"
    | "diagram-labelling"
    | "multiple-choice"
    | "short-answer";

export interface PracticeQuestionOption {
    label: string;
    content: string;
}

export interface PracticeQuestion {
    id: string;
    number: number;
    text: string;
    correctAnswer: string;
    explanation?: string;
    passageRef?: string;
    wordLimit?: number;
}

export interface PracticeQuestionGroup {
    id: string;
    title: string;
    type: PracticeQuestionType;
    instruction: string;
    options?: PracticeQuestionOption[];
    questions: PracticeQuestion[];
}

export interface PracticePassageParagraph {
    id: string;
    label: string;
    content: string;
    isHiddenLabel?: boolean;
}

export interface PracticePassage {
    id: string;
    part: number;
    title: string;
    instruction: string;
    isDragHeadingOnParagraph?: boolean;
    paragraphs: PracticePassageParagraph[];
    questionGroups: PracticeQuestionGroup[];
}

export interface IELTSReadingTest {
    id: string;
    category: PracticeCategory;
    slug: string;
    title: string;
    skill: PracticeSkill;
    durationMinutes: number;
    sourceLabel: string;
    level: string;
    description: string;
    note?: string;
    passages: PracticePassage[];
}

export const mockPracticeTests: IELTSReadingTest[] = [
    {
        id: "ielts-reading-full-mock-test-1",
        category: "ielts",
        slug: "ielts-reading-full-mock-test-1",
        title: "IELTS Reading Full Mock Test 1",
        skill: "reading",
        durationMinutes: 60,
        sourceLabel: "IELTS Academic Reading - Original Mock Test 1",
        level: "Academic",
        description:
            "A full IELTS Reading mock test for UI development, including 3 passages and 40 questions.",
        note:
            "This is an original mock dataset for UI development. It does not reproduce Cambridge IELTS 16/17 copyrighted passages.",
        passages: [
            {
                id: "passage-1",
                part: 1,
                title: "Why We Need to Protect Polar Bears",
                instruction: "Read the text and answer questions 1-13.",
                paragraphs: [
                    {
                        id: "p1-a",
                        label: "A",
                        isHiddenLabel: false,
                        content:
                            "Polar bears are increasingly threatened by the effects of climate change, but their disappearance could have far-reaching consequences. They are uniquely adapted to the extreme conditions of the Arctic Circle, where temperatures can reach -40°C. One reason for this is that they have up to 11 centimetres of fat underneath their skin. Humans with comparable levels of adipose tissue would be considered obese and would be likely to suffer from diabetes and heart disease. Yet polar bears experience no such consequences.",
                    },
                    {
                        id: "p1-b",
                        label: "B",
                        isHiddenLabel: false,
                        content:
                            "A genetic study comparing polar bears with their closest relatives, brown bears, has helped researchers understand this mystery. Scientists found that polar bears have genetic adaptations linked to the processing of fat in the blood. One gene, associated with cholesterol transport, may help explain why polar bears can survive on a high-fat diet without developing the same health problems seen in humans. This makes the species potentially valuable for medical research into heart disease.",
                    },
                    {
                        id: "p1-c",
                        label: "C",
                        isHiddenLabel: false,
                        content:
                            "The polar bear may also offer clues about osteoporosis, a disease in which bones become weak and less dense. Female polar bears spend months inside maternity dens during pregnancy and early motherhood. During this period, they fast and rely on stored energy while also feeding their cubs. In many mammals, such conditions would cause significant bone loss. Surprisingly, female polar bears are able to maintain strong bones despite long periods of inactivity and limited nutrition.",
                    },
                    {
                        id: "p1-d",
                        label: "D",
                        isHiddenLabel: false,
                        content:
                            "Researchers have discovered that pregnant polar bears appear to increase bone density before entering their dens. When they emerge months later, their bones show little evidence of serious decline. Understanding this mechanism could benefit people who are bedridden for long periods, as well as astronauts who lose bone density in space. Such discoveries show that conservation can have unexpected benefits for human health.",
                    },
                    {
                        id: "p1-e",
                        label: "E",
                        isHiddenLabel: false,
                        content:
                            "However, medical usefulness should not be the only reason to protect polar bears. People often support conservation for animals they believe are intelligent or emotionally complex, such as elephants and primates. Bears are sometimes viewed as aggressive and simple-minded, yet field observations suggest otherwise. Polar bears have shown problem-solving ability, including using objects to reach food and making calculated attempts to access areas above them.",
                    },
                    {
                        id: "p1-f",
                        label: "F",
                        isHiddenLabel: false,
                        content:
                            "Other observations suggest that polar bears can display playfulness and emotional behaviour. Some have been seen manipulating objects in ways that appear deliberate rather than accidental. Others have formed unusual relationships with dogs and humans in controlled settings. Although these accounts are not always easy to test scientifically, they challenge the idea that polar bears are merely instinctive predators.",
                    },
                    {
                        id: "p1-g",
                        label: "G",
                        isHiddenLabel: false,
                        content:
                            "If climate change leads to the extinction of polar bears, the loss would be greater than the disappearance of a single Arctic predator. Humanity could lose opportunities for medical insight, and the natural world would lose an intelligent and majestic animal. Protecting polar bears therefore means protecting both ecological balance and a source of scientific possibility.",
                    },
                ],
                questionGroups: [
                    {
                        id: "p1-q1-5",
                        title: "Questions 1-5",
                        type: "true-false-not-given",
                        instruction:
                            "Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, or NOT GIVEN if there is no information on this.",
                        questions: [
                            {
                                id: "q1",
                                number: 1,
                                text: "Polar bears can live with levels of body fat that would be unhealthy for humans.",
                                correctAnswer: "TRUE",
                                passageRef: "Paragraph A",
                                explanation:
                                    "Paragraph A says humans with comparable fat levels would be considered obese and at risk of disease, while polar bears experience no such consequences.",
                            },
                            {
                                id: "q2",
                                number: 2,
                                text: "Brown bears are better adapted to Arctic conditions than polar bears.",
                                correctAnswer: "FALSE",
                                passageRef: "Paragraph B",
                                explanation:
                                    "Paragraph B describes brown bears as relatives used for comparison, not as animals better adapted to the Arctic.",
                            },
                            {
                                id: "q3",
                                number: 3,
                                text: "Female polar bears can maintain bone strength during long periods inside maternity dens.",
                                correctAnswer: "TRUE",
                                passageRef: "Paragraph C",
                                explanation:
                                    "Paragraph C says female polar bears maintain strong bones despite inactivity and limited nutrition.",
                            },
                            {
                                id: "q4",
                                number: 4,
                                text: "Most astronauts have been treated using medicine developed from polar bear research.",
                                correctAnswer: "NOT GIVEN",
                                explanation:
                                    "The passage says astronauts could potentially benefit, but it does not say most astronauts have already been treated.",
                            },
                            {
                                id: "q5",
                                number: 5,
                                text: "The writer believes medical value is the only strong argument for protecting polar bears.",
                                correctAnswer: "FALSE",
                                passageRef: "Paragraph E",
                                explanation:
                                    "Paragraph E states that medical usefulness should not be the only reason to protect polar bears.",
                            },
                        ],
                    },
                    {
                        id: "p1-q6-9",
                        title: "Questions 6-9",
                        type: "sentence-completion",
                        instruction:
                            "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
                        questions: [
                            {
                                id: "q6",
                                number: 6,
                                text: "The polar bear's high-fat diet may help scientists study human ______.",
                                correctAnswer: "heart disease",
                                passageRef: "Paragraph B",
                                explanation:
                                    "Paragraph B says polar bears may be valuable for medical research into heart disease.",
                                wordLimit: 2,
                            },
                            {
                                id: "q7",
                                number: 7,
                                text: "Osteoporosis causes bones to become weak and less ______.",
                                correctAnswer: "dense",
                                passageRef: "Paragraph C",
                                wordLimit: 1,
                            },
                            {
                                id: "q8",
                                number: 8,
                                text: "Female polar bears spend several months inside maternity ______.",
                                correctAnswer: "dens",
                                passageRef: "Paragraph C",
                                wordLimit: 1,
                            },
                            {
                                id: "q9",
                                number: 9,
                                text: "Some observations suggest polar bears are not merely ______ predators.",
                                correctAnswer: "instinctive",
                                passageRef: "Paragraph F",
                                wordLimit: 1,
                            },
                        ],
                    },
                    {
                        id: "p1-q10-13",
                        title: "Questions 10-13",
                        type: "matching-information",
                        instruction:
                            "Which paragraph contains the following information? Write the correct letter A-G.",
                        questions: [
                            {
                                id: "q10",
                                number: 10,
                                text: "a comparison between polar bears and humans with similar fat levels",
                                correctAnswer: "A",
                                explanation:
                                    "Paragraph A compares polar bear fat levels with unhealthy levels of fat in humans.",
                            },
                            {
                                id: "q11",
                                number: 11,
                                text: "a possible benefit for people who cannot move for long periods",
                                correctAnswer: "D",
                            },
                            {
                                id: "q12",
                                number: 12,
                                text: "examples that challenge a common negative view of bears",
                                correctAnswer: "E",
                            },
                            {
                                id: "q13",
                                number: 13,
                                text: "the idea that extinction would remove both ecological and scientific value",
                                correctAnswer: "G",
                            },
                        ],
                    },
                ],
            },
            {
                id: "passage-2",
                part: 2,
                title: "The Science of Learning Spaces",
                instruction: "Read Passage 2 and answer Questions 14-26.",
                isDragHeadingOnParagraph: true,
                paragraphs: [
                    {
                        id: "p2-a",
                        label: "A",
                        isHiddenLabel: false,
                        content:
                            "For much of the twentieth century, classrooms were designed around a simple assumption: a teacher would stand at the front and students would sit in rows. This arrangement was efficient for lectures, but it offered little support for discussion, collaboration or independent investigation.",
                    },
                    {
                        id: "p2-b",
                        label: "B",
                        isHiddenLabel: false,
                        content:
                            "Recent research into learning spaces suggests that furniture, light, sound and movement can influence how students behave. A room with movable tables can shift quickly from a lecture to group work, while poor acoustics may make it difficult for learners to follow instructions. The physical environment does not teach by itself, but it can either support or obstruct good teaching.",
                    },
                    {
                        id: "p2-c",
                        label: "C",
                        isHiddenLabel: false,
                        content:
                            "One influential idea is flexibility. In a flexible classroom, students may work alone, in pairs or in larger teams during the same lesson. Teachers can create zones for reading, experiments, digital tasks and feedback. This does not mean that every lesson must be informal; rather, the room should allow the teacher to choose the arrangement that matches the activity.",
                    },
                    {
                        id: "p2-d",
                        label: "D",
                        isHiddenLabel: false,
                        content:
                            "There are practical limits. Flexible furniture costs more than standard desks, and some schools lack space to store unused chairs or equipment. Teachers may also need time to learn how to manage movement without losing focus. A redesigned room can fail if it is introduced without professional support.",
                    },
                    {
                        id: "p2-e",
                        label: "E",
                        isHiddenLabel: false,
                        content:
                            "Another area of interest is natural light. Several studies have linked daylight with improved mood and attention, although researchers disagree about the size of the effect. Too much sunlight can create glare on screens, so designers often combine large windows with blinds, shaded areas and careful screen placement.",
                    },
                    {
                        id: "p2-f",
                        label: "F",
                        isHiddenLabel: false,
                        content:
                            "The best learning spaces are therefore not simply attractive rooms. They are environments in which design decisions are connected to teaching decisions. When teachers, students and architects work together, the result is more likely to serve real classroom routines rather than fashionable images in a brochure.",
                    },
                ],
                questionGroups: [
                    {
                        id: "p2-q14-18",
                        title: "Questions 14-18",
                        type: "matching-headings",
                        instruction:
                            "Choose the correct heading for paragraphs B-F from the list of headings below.",
                        options: [
                            { label: "i", content: "The cost of modern classroom furniture" },
                            { label: "ii", content: "How physical conditions affect learning behaviour" },
                            { label: "iii", content: "The benefits and limits of daylight" },
                            { label: "iv", content: "A historical account of school uniforms" },
                            { label: "v", content: "Design linked with teaching needs" },
                            { label: "vi", content: "The meaning of flexibility" },
                            { label: "vii", content: "Problems when redesign is poorly supported" },
                        ],
                        questions: [
                            { id: "q14", number: 14, text: "Paragraph B", correctAnswer: "ii" },
                            { id: "q15", number: 15, text: "Paragraph C", correctAnswer: "vi" },
                            { id: "q16", number: 16, text: "Paragraph D", correctAnswer: "vii" },
                            { id: "q17", number: 17, text: "Paragraph E", correctAnswer: "iii" },
                            { id: "q18", number: 18, text: "Paragraph F", correctAnswer: "v" },
                        ],
                    },
                    {
                        id: "p2-q19-22",
                        title: "Questions 19-22",
                        type: "matching-sentence-ending",
                        instruction: "Complete each sentence with the correct ending A-F.",
                        options: [
                            { label: "A", content: "teachers had time to practise new routines." },
                            { label: "B", content: "students needed to listen to lectures." },
                            { label: "C", content: "screens were placed near shaded areas." },
                            { label: "D", content: "architects worked without teachers." },
                            { label: "E", content: "the room supported several activity types." },
                            { label: "F", content: "schools wanted to store extra equipment." },
                        ],
                        questions: [
                            {
                                id: "q19",
                                number: 19,
                                text: "Traditional rows of desks were useful when",
                                correctAnswer: "B",
                            },
                            {
                                id: "q20",
                                number: 20,
                                text: "Movable tables are useful because",
                                correctAnswer: "E",
                            },
                            {
                                id: "q21",
                                number: 21,
                                text: "A redesigned classroom may be unsuccessful if",
                                correctAnswer: "A",
                            },
                            {
                                id: "q22",
                                number: 22,
                                text: "Glare can be reduced when",
                                correctAnswer: "C",
                            },
                        ],
                    },
                    {
                        id: "p2-q23-26",
                        title: "Questions 23-26",
                        type: "yes-no-not-given",
                        instruction:
                            "Do the following statements reflect the claims of the writer? Write YES, NO or NOT GIVEN.",
                        questions: [
                            {
                                id: "q23",
                                number: 23,
                                text: "Classroom design should be connected to the way teachers teach.",
                                correctAnswer: "YES",
                                passageRef: "Paragraph F",
                            },
                            {
                                id: "q24",
                                number: 24,
                                text: "Flexible classrooms are always cheaper than traditional classrooms.",
                                correctAnswer: "NO",
                                passageRef: "Paragraph D",
                            },
                            {
                                id: "q25",
                                number: 25,
                                text: "Students prefer flexible rooms to all other types of classroom.",
                                correctAnswer: "NOT GIVEN",
                            },
                            {
                                id: "q26",
                                number: 26,
                                text: "The physical environment alone is enough to produce good learning.",
                                correctAnswer: "NO",
                                passageRef: "Paragraph B",
                            },
                        ],
                    },
                ],
            },
            {
                id: "passage-3",
                part: 3,
                title: "Mapping the Deep Ocean",
                instruction: "Read Passage 3 and answer Questions 27-40.",
                paragraphs: [
                    {
                        id: "p3-a",
                        label: "A",
                        isHiddenLabel: false,
                        content:
                            "Although satellites can measure the surface of the sea with impressive precision, they cannot directly reveal the shape of the ocean floor. For decades, large areas of the seabed have remained less accurately mapped than the surfaces of some planets. This gap matters because submarine mountains, trenches and plains influence currents, habitats and the routes chosen for cables and scientific expeditions.",
                    },
                    {
                        id: "p3-b",
                        label: "B",
                        isHiddenLabel: false,
                        content:
                            "Modern seabed mapping often relies on multibeam sonar. A research vessel sends out a fan of sound pulses and records the time taken for echoes to return. Since sound travels through seawater at a known speed, scientists can estimate depth. Repeated measurements create a digital model of the seabed, but the process is slow because ships must pass over the area being mapped.",
                    },
                    {
                        id: "p3-c",
                        label: "C",
                        isHiddenLabel: false,
                        content:
                            "Autonomous underwater vehicles, or AUVs, can collect higher-resolution data closer to the seabed. They follow programmed routes and carry sensors that measure depth, temperature and sometimes chemical signals. Their weakness is endurance: batteries limit the distance they can travel, and recovery can be difficult in rough weather.",
                    },
                    {
                        id: "p3-d",
                        label: "D",
                        isHiddenLabel: false,
                        content:
                            "Some researchers are experimenting with artificial intelligence to identify geological features automatically. Instead of drawing every ridge and channel by hand, scientists train software on existing maps. The software then suggests likely features in new data. Human experts still check the results, especially when the data is noisy or incomplete.",
                    },
                    {
                        id: "p3-e",
                        label: "E",
                        isHiddenLabel: false,
                        content:
                            "Better maps may improve conservation. Many deep-sea species live on particular landforms, such as seamounts where currents bring food. Accurate maps can help planners decide where fishing, mining or cable-laying should be limited. Yet maps alone cannot settle political debates about how the ocean should be used.",
                    },
                    {
                        id: "p3-f",
                        label: "F",
                        isHiddenLabel: false,
                        content:
                            "International projects aim to create a public map of the entire ocean floor. The challenge is not only technical but also organisational. Data collected by navies, companies and research institutes may be confidential, stored in incompatible formats or simply forgotten on old drives. Progress therefore depends on diplomacy as well as technology.",
                    },
                    {
                        id: "p3-diagram",
                        label: "Diagram",
                        isHiddenLabel: true,
                        content:
                            "Diagram: A simplified autonomous underwater vehicle includes a battery unit, sensor module and navigation system. This hidden-label paragraph exists only to help test diagram-labelling UI.",
                    },
                ],
                questionGroups: [
                    {
                        id: "p3-q27-30",
                        title: "Questions 27-30",
                        type: "matching-features",
                        instruction: "Match each feature with the correct description A-G.",
                        options: [
                            { label: "A", content: "uses sound echoes to calculate depth" },
                            { label: "B", content: "is mainly limited by battery life" },
                            { label: "C", content: "helps identify areas where human activity may be restricted" },
                            { label: "D", content: "suggests geological features for experts to check" },
                            { label: "E", content: "can gather close-range high-resolution data" },
                            { label: "F", content: "requires cooperation between different organisations" },
                            { label: "G", content: "directly photographs the seabed from satellites" },
                        ],
                        questions: [
                            { id: "q27", number: 27, text: "Multibeam sonar", correctAnswer: "A" },
                            { id: "q28", number: 28, text: "Autonomous underwater vehicles", correctAnswer: "E" },
                            { id: "q29", number: 29, text: "Artificial intelligence systems", correctAnswer: "D" },
                            { id: "q30", number: 30, text: "International mapping projects", correctAnswer: "F" },
                        ],
                    },
                    {
                        id: "p3-q31-34",
                        title: "Questions 31-34",
                        type: "flowchart-completion",
                        instruction:
                            "Complete the flowchart below. Choose ONE WORD ONLY from the passage for each answer.",
                        questions: [
                            {
                                id: "q31",
                                number: 31,
                                text: "Ship sends sound ____ towards the seabed.",
                                correctAnswer: "pulses",
                                passageRef: "Paragraph B",
                                wordLimit: 1,
                            },
                            {
                                id: "q32",
                                number: 32,
                                text: "Echoes return after a measured amount of ____.",
                                correctAnswer: "time",
                                passageRef: "Paragraph B",
                                wordLimit: 1,
                            },
                            {
                                id: "q33",
                                number: 33,
                                text: "Scientists estimate ____ from the travel time.",
                                correctAnswer: "depth",
                                passageRef: "Paragraph B",
                                wordLimit: 1,
                            },
                            {
                                id: "q34",
                                number: 34,
                                text: "Repeated measurements create a digital ____.",
                                correctAnswer: "model",
                                passageRef: "Paragraph B",
                                wordLimit: 1,
                            },
                        ],
                    },
                    {
                        id: "p3-q35-37",
                        title: "Questions 35-37",
                        type: "diagram-labelling",
                        instruction:
                            "Label the diagram of an AUV. Choose NO MORE THAN TWO WORDS from the passage.",
                        questions: [
                            {
                                id: "q35",
                                number: 35,
                                text: "Power source that limits travel distance: ____",
                                correctAnswer: "batteries",
                                passageRef: "Paragraph C",
                                wordLimit: 2,
                            },
                            {
                                id: "q36",
                                number: 36,
                                text: "Route type followed by the vehicle: ____ routes",
                                correctAnswer: "programmed",
                                passageRef: "Paragraph C",
                                wordLimit: 1,
                            },
                            {
                                id: "q37",
                                number: 37,
                                text: "One environmental measurement collected by sensors: ____",
                                correctAnswer: "temperature",
                                passageRef: "Paragraph C",
                                wordLimit: 1,
                            },
                        ],
                    },
                    {
                        id: "p3-q38-40",
                        title: "Questions 38-40",
                        type: "short-answer",
                        instruction:
                            "Answer the questions below. Choose NO MORE THAN THREE WORDS from the passage.",
                        questions: [
                            {
                                id: "q38",
                                number: 38,
                                text: "What kind of underwater landform can bring food to deep-sea species?",
                                correctAnswer: "seamounts",
                                passageRef: "Paragraph E",
                                wordLimit: 3,
                            },
                            {
                                id: "q39",
                                number: 39,
                                text: "Besides technology, what does progress in global mapping depend on?",
                                correctAnswer: "diplomacy",
                                passageRef: "Paragraph F",
                                wordLimit: 3,
                            },
                            {
                                id: "q40",
                                number: 40,
                                text: "Data may be confidential, incompatible, or forgotten on old ____.",
                                correctAnswer: "drives",
                                passageRef: "Paragraph F",
                                wordLimit: 1,
                            },
                        ],
                    },
                ],
            },
        ],
    },
];

export const getAllQuestions = (test: IELTSReadingTest): PracticeQuestion[] => {
    return test.passages.flatMap((passage) =>
        passage.questionGroups.flatMap((group) => group.questions)
    );
};

export const getQuestionCount = (test: IELTSReadingTest): number => {
    return getAllQuestions(test).length;
};
