import React, { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../../assets/Css/style.css";
import countriesService from "../../services/countriesService";
import categorieService from "../../services/Categorieservice";

// تم إزالة البيانات الثابتة - الآن نعتمد على البيانات من الداشبورد فقط

const getInitialFavorites = () => {
  const storedFavorites = localStorage.getItem("favorites");
  return storedFavorites ? JSON.parse(storedFavorites) : [];
};

export default function TwoCreateGame({
  title = "ما نزل مؤخراً",
  initiallyOpen = true,
  onSelect,
}) {
  const [activeFlag, setActiveFlag] = useState(null);
  const [activeCategory, setActiveCategory] = useState("recent");
  const [openSections, setOpenSections] = useState({});
  const [favorites, setFavorites] = useState(getInitialFavorites);
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(() => {
    const stored = localStorage.getItem("selectedItems");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("selectedItems", JSON.stringify(selected));
  }, [selected]);

  useEffect(() => {
    fetchCountriesAndCategories();
  }, []);

  const fetchCountriesAndCategories = async () => {
    try {
      setLoading(true);
      
      // تحديث البيانات دائماً من API - لا نعتمد على localStorage للتخزين المؤقت
      // هذا يضمن أن البيانات محدثة دائماً من الداشبورد
      
      console.log("🔄 جاري تحديث البيانات من الداشبورد...");
      
      // Fetch countries from API
      let countriesData = [];
      try {
        const countriesResponse = await countriesService.get();
        if (countriesResponse?.data?.data?.data) {
          countriesData = countriesResponse.data.data.data;
        } else if (countriesResponse?.data?.data) {
          countriesData = countriesResponse.data.data;
        } else if (countriesResponse?.data) {
          countriesData = Array.isArray(countriesResponse.data) ? countriesResponse.data : [];
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
      
      // Fetch categories from API
      let categoriesData = [];
      try {
        const categoriesResponse = await categorieService.get();
        if (categoriesResponse?.data?.data?.data) {
          categoriesData = categoriesResponse.data.data.data;
        } else if (categoriesResponse?.data?.data) {
          categoriesData = categoriesResponse.data.data;
        } else if (categoriesResponse?.data) {
          categoriesData = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
      
      const validCountries = Array.isArray(countriesData) ? countriesData : [];
      const validCategories = Array.isArray(categoriesData) ? categoriesData : [];
      
      console.log("🌍 Final Countries Data:", validCountries);
      console.log("📂 Final Categories Data:", validCategories);
      
      // طباعة تفاصيل الأقسام مع country_id للتأكد من الربط
      console.log("🔍 فحص البيانات الكاملة للأقسام:", validCategories);
      
      setCountries(validCountries);
      setCategories(validCategories);
      
      // حفظ البيانات في localStorage للاستخدام السريع (ولكن سيتم تحديثها في كل مرة)
      localStorage.setItem("countries", JSON.stringify(validCountries));
      localStorage.setItem("categories", JSON.stringify(validCategories));
      
    } catch (error) {
      console.error("Error in fetchCountriesAndCategories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = "two-create-selection-styles";
    if (document.getElementById(id)) return;
    const css = `
      .cat-item.disabled {
        opacity: 0.4;
        filter: grayscale(80%);
        cursor: not-allowed;
        pointer-events: none;
        transition: opacity 0.3s ease, filter 0.3s ease;
      }
    `;
    const style = document.createElement("style");
    style.id = id;
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }, []);

  // Dynamic flags from countries data - using exact same method as CountryShow.jsx
  const flags = countries.map(country => {
    console.log(`🏳️ Processing flag for country ${country.name}:`, country.flag);
    return {
      id: country.id,
      name: country.name,
      img: country.flag ? `https://appgames.fikriti.com/${country.flag}` : "images/download.webp"
    };
  });

  const categoryTabs = [
    { id: "heart", icon: "fa-solid fa-heart" },
    { id: "recent", icon: "fa-solid fa-list-ul" },
    { id: "all", icon: "fa-solid fa-grip" },
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      const popups = document.querySelectorAll(".info-popup.visible");
      popups.forEach((popup) => {
        if (!popup.contains(event.target)) {
          popup.classList.remove("visible");
        }
      });
    }
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleFavorite = (itemId) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(itemId)) {
        return prevFavorites.filter((id) => id !== itemId);
      } else {
        return [...prevFavorites, itemId];
      }
    });
  };

  // Group categories by country
  const getCategoriesByCountry = () => {
    let allCategories = [];
    
    // استخدام الفئات من الداشبورد فقط - لا توجد بيانات افتراضية
    allCategories = categories.map(category => ({
      id: category.id,
      title: category.name || category.title,
      name: category.name || category.title,
      img: (() => {
        // استخدام نفس الطريقة المستخدمة في CategoryShow.jsx
        let imagePath = category.image;
        if (!imagePath) return "images/zGame-All-Pages-_10_-removebg-preview.png";
        if (!imagePath.startsWith("http")) {
          imagePath = `https://appgames.fikriti.com/${category.image}`;
        }
        return imagePath;
      })(),
      description: category.description,
      country_id: category.country_id || category.countryId || category.country?.id || category.parent_id
    }));
    
    // Filter by favorites if needed
    if (activeCategory === "heart") {
      allCategories = allCategories.filter((item) => favorites.includes(item.id));
    }
    
    // Group by country
    const grouped = {};
    
    // Add categories with country_id - include categories that have a valid country_id
    // والأقسام بدون country_id تظهر في قسم "فئات عامة"
    allCategories.forEach(category => {
      const countryId = category.country_id;
      console.log(`🔍 فحص القسم: ${category.name} - country_id: ${countryId}`);
      if (countryId && countryId !== null && countryId !== undefined) {
        if (!grouped[countryId]) {
          grouped[countryId] = [];
        }
        grouped[countryId].push(category);
        console.log(`✅ تم إضافة القسم ${category.name} للدولة ${countryId}`);
      } else {
        // إضافة الأقسام بدون country_id لقسم "فئات عامة"
        if (!grouped['general']) {
          grouped['general'] = [];
        }
        grouped['general'].push(category);
        console.log(`📝 تم إضافة القسم ${category.name} للفئات العامة`);
      }
    });
    
    return grouped;
  };
  
  const categoriesByCountry = getCategoriesByCountry();

  const sectionTitle = (() => {
    if (activeCategory === "heart") return "المفضلة";
    if (activeCategory === "all") return "جميع الفئات";
    
    // Show country name if a specific country is selected
    if (activeFlag && activeFlag !== "all") {
      const selectedCountry = countries.find(country => country.id == activeFlag);
      return selectedCountry ? selectedCountry.name : "ما نزل مؤخراً";
    }
    
    return "ما نزل مؤخراً";
  })();

  const toggleSelect = (it) => {
    setSelected((prev) => {
      const exists = prev.find((p) => p.id === it.id);
      if (exists) {
        return prev.filter((p) => p.id !== it.id);
      }
      if (prev.length >= 6) return prev; // منع إضافة أكثر من 6
      return [...prev, it];
    });
  };

  const removeSelectedById = (id) => {
    setSelected((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="two-create-container">
      
      <div className="title-section">
        <h2 className="main-title">اختر الفئات</h2>
        <p className="sub-title">
          ٣ فئات لفريقك و٣ فئات للفريق المنافس، بمجموع ٦ فئات و٣٦ سؤال مختلف.
        </p>
      </div>

      <hr className="divider" />

      <div className="flags-container">
        <div className="flag-wrapper">
          <div
            className={`flag-all ${activeFlag === "all" ? "active" : ""}`}
            onClick={() => setActiveFlag("all")}
          >
            الكل
          </div>
        </div>
        {flags.map((flag) => (
          <div key={flag.id} className="flag-wrapper">
            <img
              src={flag.img}
              alt={flag.name || flag.id}
              className={`flag-img ${activeFlag === flag.id ? "active" : ""}`}
              onClick={() => setActiveFlag(flag.id)}
              title={flag.name}
            />
          </div>
        ))}
      </div>

      <hr className="divider" />

      <div className="categories-container">
        {categoryTabs.map((cat) => (
          <div
            key={cat.id}
            className={`category-btn ${activeCategory === cat.id ? "active" : ""}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <i className={cat.icon}></i>
          </div>
        ))}
      </div>

      <hr className="divider" />

      <div className="search-section">
        <input
          type="text"
          className="search-input"
          placeholder="البحث باسم الفئة"
        />
        <button className="search-btn">
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>

      {/* Render sections dynamically based on countries and categories */}
      {activeCategory === "heart" ? (
        // Show favorites section
        (() => {
          const isOpen = openSections['favorites'] ?? true;
          const toggleSection = () => {
            setOpenSections(prev => ({
              ...prev,
              'favorites': !isOpen
            }));
          };
          
          return (
            <section className="categories-section" aria-labelledby="favorites-title" dir="rtl">
              <div className={`categories-card ${isOpen ? "open" : "closed"}`}>
                <button
                  className="toggle-btn"
                  onClick={toggleSection}
                  aria-expanded={isOpen}
                  aria-controls="favorites-grid"
                >
                  {isOpen ? (
                    <i className="fa-solid fa-minus" style={{ color: "#000", fontSize: "20px" }}></i>
                  ) : (
                    <i className="fa-solid fa-plus" style={{ color: "#000", fontSize: "20px" }}></i>
                  )}
                </button>

                <div id="favorites-title" className="section-title" role="heading" aria-level={2}>
                  المفضلة
                </div>

                <div id="favorites-grid" className={`cats-grid-wrapper ${isOpen ? "show" : "hide"}`}>
              <div className="cats-grid">
                {Object.values(categoriesByCountry).flat().map((it) => (
                  <div
                    key={it.id}
                    className={`cat-item 
                      ${selected.find((s) => s.id === it.id) ? "selected" : ""} 
                      ${selected.length >= 6 && !selected.find((s) => s.id === it.id) ? "disabled" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      toggleSelect(it);
                      onSelect && onSelect(it);
                    }}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      (toggleSelect(it), onSelect && onSelect(it))
                    }
                    aria-label={`فتح فئة ${it.title}`}
                  >
                    <div className="cat-image">
                      {it.img ? (
                        <img src={it.img} alt={it.title} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: '#eee' }} />
                      )}

                      <div className="info-container">
                        <button
                          className="info-btn"
                          aria-label={`معلومات عن ${it.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const popup = e.currentTarget.nextElementSibling;
                            popup.classList.toggle("visible");
                          }}
                        >
                          ❕
                        </button>

                        <div className="info-popup">
                          <p className="info-text">{it.description || "معلومة سريعة عن الفئة"}</p>
                          <button
                            className="favorite-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(it.id);
                            }}
                          >
                            {favorites.includes(it.id)
                              ? "إزالة من المفضلة"
                              : "إضافة إلى المفضلة"}
                          </button>
                        </div>
                      </div>

                      {it.badge && (
                        <div className="cat-badge" aria-hidden>
                          {it.badge}
                        </div>
                      )}
                    </div>
                    <div className="cat-label">{it.title || it.name}</div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </section>
          );
        })()
      ) : (
        // Show country sections
        <>
          {/* Show sections based on active flag */}
          {activeFlag === "all" || !activeFlag ? (
            // Show all countries
            countries.map((country) => {
              const countryCategories = categoriesByCountry[country.id] || [];
              const isOpen = openSections[`country-${country.id}`] ?? true;
              
              const toggleSection = () => {
                setOpenSections(prev => ({
                  ...prev,
                  [`country-${country.id}`]: !isOpen
                }));
              };
              
              return (
                <section key={country.id} className="categories-section" aria-labelledby={`country-${country.id}-title`} dir="rtl">
                  <div className={`categories-card ${isOpen ? "open" : "closed"}`}>
                    <button
                      className="toggle-btn"
                      onClick={toggleSection}
                      aria-expanded={isOpen}
                      aria-controls={`country-${country.id}-grid`}
                    >
                      {isOpen ? (
                        <i className="fa-solid fa-minus" style={{ color: "#000", fontSize: "20px" }}></i>
                      ) : (
                        <i className="fa-solid fa-plus" style={{ color: "#000", fontSize: "20px" }}></i>
                      )}
                    </button>

                    <div id={`country-${country.id}-title`} className="section-title" role="heading" aria-level={2}>
                      {country.name}
                    </div>

                    <div id={`country-${country.id}-grid`} className={`cats-grid-wrapper ${isOpen ? "show" : "hide"}`}>
                      {countryCategories.length > 0 ? (
                        <div className="cats-grid">
                          {countryCategories.map((it) => (
                          <div
                            key={it.id}
                            className={`cat-item 
                              ${selected.find((s) => s.id === it.id) ? "selected" : ""} 
                              ${selected.length >= 6 && !selected.find((s) => s.id === it.id) ? "disabled" : ""}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              toggleSelect(it);
                              onSelect && onSelect(it);
                            }}
                            onKeyDown={(e) =>
                              (e.key === "Enter" || e.key === " ") &&
                              (toggleSelect(it), onSelect && onSelect(it))
                            }
                            aria-label={`فتح فئة ${it.title}`}
                          >
                            <div className="cat-image">
                              {it.img ? (
                                <img src={it.img} alt={it.title} />
                              ) : (
                                <div style={{ width: "100%", height: "100%", background: '#eee' }} />
                              )}

                              <div className="info-container">
                                <button
                                  className="info-btn"
                                  aria-label={`معلومات عن ${it.title}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const popup = e.currentTarget.nextElementSibling;
                                    popup.classList.toggle("visible");
                                  }}
                                >
                                  ❕
                                </button>

                                <div className="info-popup">
                                  <p className="info-text">{it.description || "معلومة سريعة عن الفئة"}</p>
                                  <button
                                    className="favorite-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(it.id);
                                    }}
                                  >
                                    {favorites.includes(it.id)
                                      ? "إزالة من المفضلة"
                                      : "إضافة إلى المفضلة"}
                                  </button>
                                </div>
                              </div>

                              {it.badge && (
                                <div className="cat-badge" aria-hidden>
                                  {it.badge}
                                </div>
                              )}
                            </div>
                            <div className="cat-label">{it.title || it.name}</div>
                          </div>
                        ))}
                        </div>
                      ) : (
                        <div className="empty-categories" style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                          لم يتم إضافة أقسام
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })
          ) : (
            // Show specific country
            (() => {
              const selectedCountry = countries.find(country => country.id == activeFlag);
              const countryCategories = categoriesByCountry[activeFlag] || [];
              const isOpen = openSections[`country-${selectedCountry?.id}`] ?? true;
              
              if (!selectedCountry) return null;
              
              const toggleSection = () => {
                setOpenSections(prev => ({
                  ...prev,
                  [`country-${selectedCountry.id}`]: !isOpen
                }));
              };
              
              return (
                <section key={selectedCountry.id} className="categories-section" aria-labelledby={`country-${selectedCountry.id}-title`} dir="rtl">
                  <div className={`categories-card ${isOpen ? "open" : "closed"}`}>
                    <button
                      className="toggle-btn"
                      onClick={toggleSection}
                      aria-expanded={isOpen}
                      aria-controls={`country-${selectedCountry.id}-grid`}
                    >
                      {isOpen ? (
                        <i className="fa-solid fa-minus" style={{ color: "#000", fontSize: "20px" }}></i>
                      ) : (
                        <i className="fa-solid fa-plus" style={{ color: "#000", fontSize: "20px" }}></i>
                      )}
                    </button>

                    <div id={`country-${selectedCountry.id}-title`} className="section-title" role="heading" aria-level={2}>
                      {selectedCountry.name}
                    </div>

                    <div id={`country-${selectedCountry.id}-grid`} className={`cats-grid-wrapper ${isOpen ? "show" : "hide"}`}>
                      {countryCategories.length > 0 ? (
                        <div className="cats-grid">
                          {countryCategories.map((it) => (
                          <div
                            key={it.id}
                            className={`cat-item 
                              ${selected.find((s) => s.id === it.id) ? "selected" : ""} 
                              ${selected.length >= 6 && !selected.find((s) => s.id === it.id) ? "disabled" : ""}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              toggleSelect(it);
                              onSelect && onSelect(it);
                            }}
                            onKeyDown={(e) =>
                              (e.key === "Enter" || e.key === " ") &&
                              (toggleSelect(it), onSelect && onSelect(it))
                            }
                            aria-label={`فتح فئة ${it.title}`}
                          >
                            <div className="cat-image">
                              {it.img ? (
                                <img src={it.img} alt={it.title} />
                              ) : (
                                <div style={{ width: "100%", height: "100%", background: '#eee' }} />
                              )}

                              <div className="info-container">
                                <button
                                  className="info-btn"
                                  aria-label={`معلومات عن ${it.title}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const popup = e.currentTarget.nextElementSibling;
                                    popup.classList.toggle("visible");
                                  }}
                                >
                                  ❕
                                </button>

                                <div className="info-popup">
                                  <p className="info-text">{it.description || "معلومة سريعة عن الفئة"}</p>
                                  <button
                                    className="favorite-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(it.id);
                                    }}
                                  >
                                    {favorites.includes(it.id)
                                      ? "إزالة من المفضلة"
                                      : "إضافة إلى المفضلة"}
                                  </button>
                                </div>
                              </div>

                              {it.badge && (
                                <div className="cat-badge" aria-hidden>
                                  {it.badge}
                                </div>
                              )}
                            </div>
                            <div className="cat-label">{it.title || it.name}</div>
                          </div>
                        ))}
                        </div>
                      ) : (
                        <div className="empty-categories" style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                          لم يتم إضافة أقسام
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })()
          )}
          
          {/* Show categories without country if any */}
          {categoriesByCountry['general'] && categoriesByCountry['general'].length > 0 && (() => {
            const isOpen = openSections['general'] ?? true;
            const toggleSection = () => {
              setOpenSections(prev => ({
                ...prev,
                'general': !isOpen
              }));
            };
            
            return (
              <section className="categories-section" aria-labelledby="general-title" dir="rtl">
                <div className={`categories-card ${isOpen ? "open" : "closed"}`}>
                  <button
                    className="toggle-btn"
                    onClick={toggleSection}
                    aria-expanded={isOpen}
                    aria-controls="general-grid"
                  >
                    {isOpen ? (
                      <i className="fa-solid fa-minus" style={{ color: "#000", fontSize: "20px" }}></i>
                    ) : (
                      <i className="fa-solid fa-plus" style={{ color: "#000", fontSize: "20px" }}></i>
                    )}
                  </button>

                  <div id="general-title" className="section-title" role="heading" aria-level={2}>
                    فئات عامة
                  </div>

                  <div id="general-grid" className={`cats-grid-wrapper ${isOpen ? "show" : "hide"}`}>
                  <div className="cats-grid">
                    {categoriesByCountry['general'].map((it) => (
                      <div
                        key={it.id}
                        className={`cat-item 
                          ${selected.find((s) => s.id === it.id) ? "selected" : ""} 
                          ${selected.length >= 6 && !selected.find((s) => s.id === it.id) ? "disabled" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          toggleSelect(it);
                          onSelect && onSelect(it);
                        }}
                        onKeyDown={(e) =>
                          (e.key === "Enter" || e.key === " ") &&
                          (toggleSelect(it), onSelect && onSelect(it))
                        }
                        aria-label={`فتح فئة ${it.title}`}
                      >
                        <div className="cat-image">
                          {it.img ? (
                            <img src={it.img} alt={it.title} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", background: '#eee' }} />
                          )}

                          <div className="info-container">
                            <button
                              className="info-btn"
                              aria-label={`معلومات عن ${it.title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const popup = e.currentTarget.nextElementSibling;
                                popup.classList.toggle("visible");
                              }}
                            >
                              ❕
                            </button>

                            <div className="info-popup">
                              <p className="info-text">{it.description || "معلومة سريعة عن الفئة"}</p>
                              <button
                                className="favorite-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(it.id);
                                }}
                              >
                                {favorites.includes(it.id)
                                  ? "إزالة من المفضلة"
                                  : "إضافة إلى المفضلة"}
                              </button>
                            </div>
                          </div>

                          {it.badge && (
                            <div className="cat-badge" aria-hidden>
                              {it.badge}
                            </div>
                          )}
                        </div>
                        <div className="cat-label">{it.title || it.name}</div>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              </section>
            );
          })()}
        </>
      )}

      {selected.length > 0 && (
        <div className="selected-tray" aria-live="polite">
          <div className="selected-tray-inner">
            {selected.map((s) => (
              <div key={s.id} className="selected-thumb" title={s.title}>
                <div
                  className="remove-x"
                  onClick={() => removeSelectedById(s.id)}
                  role="button"
                  aria-label={`إزالة ${s.title}`}
                >
                  ×
                </div>
                {s.img ? (
                  <img src={s.img} alt={s.title} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: '#eee' }} />
                )}
                <div className="label">{s.title || s.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
