import { useState, useEffect } from "react"
import { getProducts, getProductById } from "../api/productList"
import Aos from "aos"
import "aos/dist/aos.css"   // 👈 fix 1: AOS ki css
import "./apicall.css"

export const Apicall = () => {
    const [search, setSearch] = useState("")
    const [allProducts, setAllProducts] = useState([])
    const [products, setProducts] = useState([])
    const [notFound, setNotFound] = useState(false)
    const [loading, setLoading] = useState(true)

    const [currentPage, setCurrentPage] = useState(1)
    const [limit, setLimit] = useState(10)

    useEffect(() => {
        fetchProducts()
        Aos.init({
            duration: 600,
            once: true,
        })
    }, [])

    useEffect(() => {
        if (search.trim() !== "") {
            const searchLower = search.trim().toLowerCase()

            const matched = allProducts.filter((p) =>
                p.title.toLowerCase().includes(searchLower)
            )
            const notMatched = allProducts.filter(
                (p) => !p.title.toLowerCase().includes(searchLower)
            )

            if (matched.length > 0) {
                setProducts([...matched, ...notMatched])
                setNotFound(false)
            } else {
                setProducts([])
                setNotFound(true)
            }
        } else {
            setProducts(allProducts)
            setNotFound(false)
        }
    }, [search, allProducts])

    const fetchProducts = async () => {
        try {
            const data = await getProducts()
            setAllProducts(data.products)
            setProducts(data.products)
        } catch (error) {
            console.error("Error fetching products:", error)
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(products.length / limit)
    const startIndex = (currentPage - 1) * limit
    const currentProducts = products.slice(startIndex, startIndex + limit)

    // 👈 fix 2: cards render hone ke baad AOS ko dobara scan karwao
    useEffect(() => {
        if (!loading) {
            Aos.refreshHard()
        }
    }, [loading, currentPage, limit, products])

    const handleSearch = (e) => {
        setSearch(e.target.value)
        setCurrentPage(1)
    }

    const handleLimitChange = (e) => {
        setLimit(Number(e.target.value))
        setCurrentPage(1)
    }

    const getPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        const pages = [1]
        const start = Math.max(2, currentPage - 1)
        const end = Math.min(totalPages - 1, currentPage + 1)

        if (start > 2) pages.push("...")
        for (let i = start; i <= end; i++) pages.push(i)
        if (end < totalPages - 1) pages.push("...")
        pages.push(totalPages)

        return pages
    }

    // discount se purana price nikalna
    const getOldPrice = (price, discount) =>
        (price / (1 - discount / 100)).toFixed(2)

    return (
        <div className="pl-page">
            <div className="pl-container">
                {/* Header */}
                <div className="pl-header">
                    <div>
                        <h1 className="pl-title">Products</h1>
                        <p className="pl-subtitle">
                            {allProducts.length} products available
                        </p>
                    </div>

                    <div className="pl-search-box">
                        <svg
                            className="pl-search-icon"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            className="pl-search"
                            placeholder="Search products..."
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="pl-grid">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="pl-skeleton" />
                        ))}
                    </div>
                )}

                {/* Not found */}
                {notFound && (
                    <div className="pl-not-found">
                        <h3>No product found</h3>
                        <p>Kuch aur naam se search karke dekhein.</p>
                    </div>
                )}

                {/* Grid */}
                <div className="pl-grid">
                    {currentProducts.map((product) => (
                        // outer div: AOS | inner article: 3D hover
                        <div data-aos="fade-up" key={product.id}>
                            <article className="pl-card">
                                <div className="pl-media">
                                    {product.discountPercentage > 0 && (
                                        <span className="pl-badge">
                                            -{Math.round(product.discountPercentage)}%
                                        </span>
                                    )}
                                    <img
                                        className="pl-img"
                                        src={product.thumbnail}
                                        alt={product.title}
                                    />
                                </div>

                                <div className="pl-body">
                                    <span className="pl-category">{product.category}</span>
                                    <h3 className="pl-name">{product.title}</h3>

                                    <div className="pl-rating">
                                        <span className="pl-star">★</span>
                                        {product.rating}
                                    </div>

                                    <div className="pl-price-row">
                                        <span className="pl-price">${product.price}</span>
                                        {product.discountPercentage > 0 && (
                                            <span className="pl-old-price">
                                                ${getOldPrice(product.price, product.discountPercentage)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </article>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {products.length > 0 && (
                    <div className="pl-pagination">
                        <div className="pl-limit">
                            <span>Per page</span>
                            <select
                                className="pl-select"
                                value={limit}
                                onChange={handleLimitChange}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={40}>40</option>
                                <option value={50}>50</option>
                            </select>
                            <span>
                                {startIndex + 1}–{Math.min(startIndex + limit, products.length)} of {products.length}
                            </span>
                        </div>

                        <div className="pl-pages">
                            <button
                                className="pl-btn"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Back
                            </button>

                            {getPageNumbers().map((page, index) =>
                                page === "..." ? (
                                    <span key={`dots-${index}`} className="pl-dots">…</span>
                                ) : (
                                    <button
                                        key={page}
                                        className={`pl-btn ${currentPage === page ? "active" : ""}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                )
                            )}

                            <button
                                className="pl-btn"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}