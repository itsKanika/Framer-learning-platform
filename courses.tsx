import { useMemo, useState } from "react"
import { addPropertyControls, ControlType } from "framer"
import { useEffect } from "react"

const COURSE_API = "https://syncsphere-hiv6.onrender.com/assignment/course-data"

interface Course {
    courseName?: string
    courseCode?: string
    description?: string
    mainCategory?: string
    shortCourse?: string
    courseType?: string
    pricePaise?: number
    priceUsdCents?: number
    refundable?: boolean
    image?: string
    thumbnail?: string
}

interface Props {
    heading: string
    subtitle: string
    backgroundColor: string

    youtubeImage?: string
    instagramImage?: string
    podcastImage?: string
    freelanceImage?: string
    notionImage?: string
    emailImage?: string
    defaultImage?: string
}

/* ---------------------------------------------
   COUNTRIES / CURRENCIES
--------------------------------------------- */

const CURRENCIES = {
    IN: {
        name: "India",
        flag: "🇮🇳",
        symbol: "₹",
        rate: 1,
    },

    US: {
        name: "USA",
        flag: "🇺🇸",
        symbol: "$",
        rate: 0.012,
    },

    GB: {
        name: "UK",
        flag: "🇬🇧",
        symbol: "£",
        rate: 0.0095,
    },

    DE: {
        name: "Germany",
        flag: "🇩🇪",
        symbol: "€",
        rate: 0.011,
    },

    AE: {
        name: "UAE",
        flag: "🇦🇪",
        symbol: "د.إ",
        rate: 0.044,
    },

    CA: {
        name: "Canada",
        flag: "🇨🇦",
        symbol: "C$",
        rate: 0.016,
    },

    AU: {
        name: "Australia",
        flag: "🇦🇺",
        symbol: "A$",
        rate: 0.018,
    },
}

type CountryCode = keyof typeof CURRENCIES

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */

export default function Courses(props: Props) {
    const {
        backgroundColor = "#FFFFFF",

        youtubeImage,
        instagramImage,
        podcastImage,
        freelanceImage,
        notionImage,
        emailImage,
        defaultImage,
    } = props

    /* ---------------------------------------------
       STATE
    --------------------------------------------- */

    const [courses, setCourses] = useState<Course[]>([])

    const [loading, setLoading] = useState(true)

    const [error, setError] = useState("")

    const [search, setSearch] = useState("")

    const [sort, setSort] = useState("default")

    /*
     * Default country = India.
     * Change it from the navbar/dropdown.
     */
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>("IN")

    /* ---------------------------------------------
       FETCH COURSES
    --------------------------------------------- */

    useEffect(() => {
        let cancelled = false

        async function loadCourses() {
            try {
                setLoading(true)
                setError("")

                const response = await fetch(COURSE_API)

                if (!response.ok) {
                    throw new Error(
                        `Course request failed (${response.status})`
                    )
                }

                const data = await response.json()

                if (!cancelled) {
                    setCourses(Array.isArray(data) ? data : [])
                }
            } catch (err) {
                if (!cancelled) {
                    setError("Live data unavailable. Please try again.")
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadCourses()

        return () => {
            cancelled = true
        }
    }, [])

    /* ---------------------------------------------
       SEARCH + SORT
    --------------------------------------------- */

    const visibleCourses = useMemo(() => {
        let result = courses.filter((course) => {
            const searchableText = [
                course.courseName,
                course.description,
                course.mainCategory,
                course.shortCourse,
                course.courseType,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()

            return searchableText.includes(search.toLowerCase())
        })

        if (sort === "low") {
            result = [...result].sort(
                (a, b) =>
                    getPriceInSelectedCurrency(a, selectedCountry) -
                    getPriceInSelectedCurrency(b, selectedCountry)
            )
        }

        if (sort === "high") {
            result = [...result].sort(
                (a, b) =>
                    getPriceInSelectedCurrency(b, selectedCountry) -
                    getPriceInSelectedCurrency(a, selectedCountry)
            )
        }

        if (sort === "name") {
            result = [...result].sort((a, b) =>
                getTitle(a).localeCompare(getTitle(b))
            )
        }

        return result
    }, [courses, search, sort, selectedCountry])

    /* ---------------------------------------------
       PAGE
    --------------------------------------------- */

    return (
        <section
            id="featured-courses"
            style={{
                width: "100%",
                minHeight: "100%",
                scrollMarginTop: 80,
                boxSizing: "border-box",
                padding: 32,

                background: backgroundColor,

                fontFamily:
                    "Inter, -apple-system, BlinkMacSystemFont, sans-serif",

                color: "#25245C",
            }}
        >
            {/* COURSE CONTROLS */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                    marginBottom: 18,
                }}
            >
                {/* SEARCH */}

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,

                        border: "1px solid #E2E4EE",

                        borderRadius: 11,

                        padding: "10px 14px",

                        background: "#FFFFFF",

                        width: 220,

                        boxSizing: "border-box",
                    }}
                >
                    <span
                        style={{
                            fontSize: 17,
                        }}
                    >
                        🔍
                    </span>

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search courses..."
                        style={{
                            border: 0,
                            outline: 0,
                            width: "100%",
                            fontSize: 14,
                            color: "#25245C",
                            background: "transparent",
                        }}
                    />
                </div>

                {/* SORT */}

                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    style={{
                        border: "1px solid #E2E4EE",

                        borderRadius: 11,

                        padding: "10px 12px",

                        background: "#FFFFFF",

                        color: "#30344A",

                        fontSize: 14,

                        cursor: "pointer",

                        outline: "none",
                    }}
                >
                    <option value="default">Sort</option>

                    <option value="low">Price: Low to High</option>

                    <option value="high">Price: High to Low</option>

                    <option value="name">Name: A to Z</option>
                </select>

                {/* COUNTRY */}

                <select
                    value={selectedCountry}
                    onChange={(e) =>
                        setSelectedCountry(e.target.value as CountryCode)
                    }
                    style={{
                        border: "1px solid #E2E4EE",

                        borderRadius: 11,

                        padding: "10px 12px",

                        background: "#FFFFFF",

                        color: "#30344A",

                        fontSize: 14,

                        fontWeight: 600,

                        cursor: "pointer",

                        outline: "none",
                    }}
                >
                    {Object.entries(CURRENCIES).map(([code, currency]) => (
                        <option key={code} value={code}>
                            {currency.flag} {currency.name} ({currency.symbol})
                        </option>
                    ))}
                </select>
            </div>

            {/* CURRENT COUNTRY */}

            <div
                style={{
                    display: "inline-flex",

                    alignItems: "center",

                    gap: 6,

                    marginBottom: 18,

                    padding: "6px 10px",

                    borderRadius: 20,

                    background: "#F3F0FF",

                    color: "#6847C7",

                    fontSize: 12,

                    fontWeight: 600,
                }}
            >
                {CURRENCIES[selectedCountry].flag}{" "}
                {CURRENCIES[selectedCountry].name} ·{" "}
                {CURRENCIES[selectedCountry].symbol}
            </div>

            {/* LOADING */}

            {loading && (
                <div
                    style={{
                        textAlign: "center",

                        padding: 70,

                        color: "#777B91",
                    }}
                >
                    <div
                        style={{
                            fontSize: 34,
                            marginBottom: 10,
                        }}
                    >
                        ✨
                    </div>
                    Loading courses...
                </div>
            )}

            {/* ERROR */}

            {!loading && error && (
                <div
                    style={{
                        padding: 15,

                        borderRadius: 12,

                        background: "#FFF3F3",

                        color: "#C0392B",

                        marginBottom: 20,

                        fontSize: 14,
                    }}
                >
                    ⚠️ {error}
                </div>
            )}

            {/* EMPTY */}

            {!loading && !error && visibleCourses.length === 0 && (
                <div
                    style={{
                        textAlign: "center",

                        padding: 70,

                        color: "#777B91",
                    }}
                >
                    <div
                        style={{
                            fontSize: 40,
                        }}
                    >
                        🔎
                    </div>

                    <h3>No courses found</h3>

                    <p>Try searching for something else.</p>
                </div>
            )}

            {/* COURSE GRID */}

            {!loading && !error && visibleCourses.length > 0 && (
                <div
                    className="courses-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 18,
                        width: "100%",
                        alignItems: "start",
                    }}
                >
                    {visibleCourses.slice(0, 8).map((course, index) => {
                        const title = getTitle(course)

                        const category = course.mainCategory || "Learning"

                        const description =
                            course.description ||
                            "Build practical skills with this course."

                        const image = getCourseImage(course, {
                            youtubeImage,
                            instagramImage,
                            podcastImage,
                            freelanceImage,
                            notionImage,
                            emailImage,
                        })

                        return (
                            <article
                                key={course.courseCode || `${title}-${index}`}
                                style={{
                                    background: "#FFFFFF",

                                    border: "1px solid #E8E8F0",

                                    borderRadius: 17,

                                    overflow: "hidden",
                                    width: "100%",
                                    minWidth: 0,
                                    alignSelf: "start",

                                    boxShadow: "0 7px 22px rgba(44,37,92,0.08)",
                                }}
                            >
                                {/* IMAGE */}

                                <div
                                    style={{
                                        height: 145,

                                        width: "100%",

                                        background: getCardBackground(index),

                                        display: "flex",

                                        alignItems: "center",

                                        justifyContent: "center",

                                        overflow: "hidden",
                                    }}
                                >
                                    {image ? (
                                        <img
                                            src={image}
                                            alt={title}
                                            style={{
                                                width: "100%",

                                                height: "100%",

                                                objectFit: "cover",

                                                display: "block",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                fontSize: 50,
                                            }}
                                        >
                                            {getEmoji(category)}
                                        </div>
                                    )}
                                </div>

                                {/* CONTENT */}

                                <div
                                    style={{
                                        padding: 17,
                                    }}
                                >
                                    {/* CATEGORY */}

                                    <div
                                        style={{
                                            display: "inline-block",

                                            padding: "5px 9px",

                                            borderRadius: 20,

                                            background: "#F0EAFF",

                                            color: "#7047D9",

                                            fontSize: 11,

                                            fontWeight: 650,

                                            marginBottom: 9,
                                        }}
                                    >
                                        {category}
                                    </div>

                                    {/* TITLE */}

                                    <h3
                                        style={{
                                            margin: "0 0 7px",

                                            fontSize: 17,

                                            lineHeight: 1.25,

                                            color: "#25245C",

                                            fontWeight: 700,
                                        }}
                                    >
                                        {title}
                                    </h3>

                                    {/* DESCRIPTION */}

                                    <p
                                        style={{
                                            margin: "0 0 8px",

                                            color: "#70758A",

                                            fontSize: 13,

                                            lineHeight: 1.5,

                                            display: "-webkit-box",

                                            WebkitLineClamp: 2,

                                            WebkitBoxOrient: "vertical",

                                            overflow: "hidden",

                                            minHeight: 39,
                                        }}
                                    >
                                        {description}
                                    </p>

                                    {/* SHORT COURSE */}

                                    {course.shortCourse && (
                                        <div
                                            style={{
                                                fontSize: 12,

                                                color: "#8A8EA0",

                                                marginBottom: 14,
                                            }}
                                        >
                                            {course.shortCourse}
                                        </div>
                                    )}

                                    {/* PRICE */}

                                    <div
                                        style={{
                                            display: "flex",

                                            alignItems: "center",

                                            justifyContent: "space-between",

                                            gap: 8,
                                        }}
                                    >
                                        <strong
                                            style={{
                                                fontSize: 18,

                                                color: "#25245C",
                                            }}
                                        >
                                            {formatCoursePrice(
                                                course,
                                                selectedCountry
                                            )}
                                        </strong>

                                        {course.refundable && (
                                            <span
                                                style={{
                                                    padding: "5px 8px",

                                                    borderRadius: 20,

                                                    background: "#EAF8EE",

                                                    color: "#26964D",

                                                    fontSize: 10,

                                                    fontWeight: 650,

                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                ✓ Refundable
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}

            <style>{`
                .courses-grid {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }
                @media (max-width: 900px) {
                    .courses-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }
                @media (max-width: 560px) {
                    .courses-grid {
                        grid-template-columns: minmax(0, 1fr);
                    }
                }
            `}</style>
        </section>
    )
}

/* =============================================
   HELPERS
============================================= */

function getTitle(course: Course) {
    return course.courseName || "Untitled Course"
}

/* =============================================
   PRICE
============================================= */

function getPriceInSelectedCurrency(course: Course, country: CountryCode) {
    const inrPrice = Number(course.pricePaise || 0) / 100

    return inrPrice * CURRENCIES[country].rate
}

function formatCoursePrice(course: Course, country: CountryCode) {
    const currency = CURRENCIES[country]

    const price = getPriceInSelectedCurrency(course, country)

    return `${currency.symbol}${price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`
}

/* =============================================
   IMAGE MAPPING
============================================= */

function getCourseImage(
    course: Course,
    images: {
        youtubeImage?: string
        instagramImage?: string
        podcastImage?: string
        freelanceImage?: string
        notionImage?: string
        emailImage?: string
    }
) {
    /*
     * If API provides an image,
     * use it first.
     */

    if (course.image) {
        return course.image
    }

    if (course.thumbnail) {
        return course.thumbnail
    }

    const text = [course.courseName, course.mainCategory, course.shortCourse]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

    if (text.includes("youtube")) {
        return images.youtubeImage
    }

    if (text.includes("instagram")) {
        return images.instagramImage
    }

    if (text.includes("podcast")) {
        return images.podcastImage
    }

    if (text.includes("freelance")) {
        return images.freelanceImage
    }

    if (text.includes("notion")) {
        return images.notionImage
    }

    if (text.includes("email") || text.includes("marketing")) {
        return images.emailImage
    }

    return images.defaultImage
}

/* =============================================
   FALLBACK EMOJI
============================================= */

function getEmoji(category: string) {
    const value = category.toLowerCase()

    if (value.includes("youtube")) return "🎬"

    if (value.includes("instagram")) return "📱"

    if (value.includes("podcast")) return "🎙️"

    if (value.includes("freelance")) return "💻"

    if (value.includes("notion")) return "📝"

    if (value.includes("email") || value.includes("marketing")) return "💌"

    if (value.includes("design")) return "🎨"

    return "📚"
}

/* =============================================
   CARD BACKGROUNDS
============================================= */

function getCardBackground(index: number) {
    const backgrounds = [
        "#F0E6FF",
        "#E8F8EA",
        "#FFF6D9",
        "#E5F4FF",
        "#FDEBEE",
        "#EFEAFF",
    ]

    return backgrounds[index % backgrounds.length]
}

/* =============================================
   FRAMER CONTROLS
============================================= */

addPropertyControls(Courses, {
    heading: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: "Featured Courses",
    },

    subtitle: {
        type: ControlType.String,
        title: "Subtitle",
        defaultValue: "Handpicked courses to accelerate your learning journey",
    },

    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#FFFFFF",
    },

    youtubeImage: {
        type: ControlType.Image,
        title: "YouTube Image",
    },

    instagramImage: {
        type: ControlType.Image,
        title: "Instagram Image",
    },

    podcastImage: {
        type: ControlType.Image,
        title: "Podcast Image",
    },

    freelanceImage: {
        type: ControlType.Image,
        title: "Freelance Image",
    },

    notionImage: {
        type: ControlType.Image,
        title: "Notion Image",
    },

    emailImage: {
        type: ControlType.Image,
        title: "Email Image",
    },

    defaultImage: {
        type: ControlType.Image,
        title: "Default Image",
    },
})
