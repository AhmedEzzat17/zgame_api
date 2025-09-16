import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import contactService from '../../services/contactService';

const ContactUs = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

    useEffect(() => {
      const bootstrapLink = document.createElement("link");
      bootstrapLink.rel = "stylesheet";
      bootstrapLink.href =
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
      bootstrapLink.id = "bootstrap-css";
  
      const iconLink = document.createElement("link");
      iconLink.rel = "stylesheet";
      iconLink.href =
        "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css";
      iconLink.id = "bootstrap-icons";
  
      document.head.appendChild(bootstrapLink);
      document.head.appendChild(iconLink);
  
      return () => {
        const existingBootstrap = document.getElementById("bootstrap-css");
        const existingIcons = document.getElementById("bootstrap-icons");
        if (existingBootstrap) document.head.removeChild(existingBootstrap);
        if (existingIcons) document.head.removeChild(existingIcons);
      };
    }, []);
  

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [currentPage, statusFilter]);

  // تحديث الإحصائيات عند تغيير الرسائل
  useEffect(() => {
    if (messages.length >= 0) {
      calculateLocalStats();
    }
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await contactService.getWithPagination(currentPage, searchTerm);
      setMessages(response.data.data.data || []);
      setTotalPages(response.data.data.last_page || 1);
    } catch (error) {
      console.error('خطأ في جلب الرسائل:', error);
      
      setMessages([]);
      setTotalPages(1);
      setMessage('حدث خطأ في جلب الرسائل');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await contactService.getStats();
      console.log('Stats API response:', statsData);
      setStats(statsData);
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      
      // حساب الإحصائيات محلياً من الرسائل الموجودة
      calculateLocalStats();
      setMessage('تم حساب الإحصائيات محلياً');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const calculateLocalStats = () => {
    const localStats = {
      total: messages.length,
      pending: messages.filter(msg => msg.status === 'pending').length,
      in_progress: messages.filter(msg => msg.status === 'in_progress').length,
      resolved: messages.filter(msg => msg.status === 'resolved').length,
      closed: messages.filter(msg => msg.status === 'closed').length
    };
    
    console.log('Local stats calculated:', localStats);
    console.log('Messages:', messages);
    setStats(localStats);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchMessages();
  };

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      await contactService.updateStatus(messageId, newStatus);
      fetchMessages();
      fetchStats();
      setMessage('تم تحديث حالة الرسالة بنجاح');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error);
      
      if (error.response?.status === 422) {
        const errorMessage = error.response?.data?.message || 'بيانات غير صحيحة';
        setMessage(`خطأ في البيانات: ${errorMessage}`);
      } else {
        setMessage('حدث خطأ في تحديث حالة الرسالة');
      }
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      try {
        await contactService.delete(id);
        fetchMessages();
        fetchStats();
        setMessage('تم حذف الرسالة بنجاح');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('خطأ في حذف الرسالة:', error);
        
        setMessage('حدث خطأ في حذف الرسالة');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const openMessageModal = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'في الانتظار', class: 'warning' },
      in_progress: { text: 'قيد المعالجة', class: 'info' },
      resolved: { text: 'تم الحل', class: 'success' },
      closed: { text: 'مغلقة', class: 'secondary' }
    };
    
    const statusInfo = statusMap[status] || { text: status, class: 'secondary' };
    return (
      <span className={`badge bg-${statusInfo.class}`}>
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mt-4" dir="rtl">
      <div className="row justify-content-center">
        <h1 className="text-center mb-4 fw-bold">إدارة رسائل التواصل</h1>
        <div className="col-md-12">
          {message && (
            <div
              className={`alert ${
                message.includes("نجاح") ? "alert-success" : "alert-danger"
              } text-center`}
            >
              {message}
            </div>
          )}

          <div className="card shadow-lg border-0">
            <div
              className="card-header text-white d-flex justify-content-between align-items-center"
              style={{ background: "#2c3e50" }}
            >
              <h4 className="mb-0">قائمة رسائل التواصل</h4>
              <Link
                to="/Dashboard/contact/create"
                className="btn btn-light btn-sm text-dark"
              >
                <i className="bi bi-plus-lg me-1"></i> إضافة رسالة
              </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="row mb-4">
                <div className="col-md-3 col-sm-6 mb-3">
                  <div className="card text-center border-0 shadow-sm">
                    <div className="card-body">
                      <i className="bi bi-envelope-fill text-primary fs-2 mb-2"></i>
                      <h5 className="card-title">{stats.total || 0}</h5>
                      <p className="card-text text-muted">إجمالي الرسائل</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 col-sm-6 mb-3">
                  <div className="card text-center border-0 shadow-sm">
                    <div className="card-body">
                      <i className="bi bi-clock-fill text-warning fs-2 mb-2"></i>
                      <h5 className="card-title">{stats.pending || 0}</h5>
                      <p className="card-text text-muted">في الانتظار</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-center border-0 shadow-sm">
                    <div className="card-body">
                      <i className="bi bi-gear-fill text-info fs-2 mb-2"></i>
                      <h5 className="card-title">{stats.in_progress || 0}</h5>
                      <p className="card-text text-muted">قيد المعالجة</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card text-center border-0 shadow-sm">
                    <div className="card-body">
                      <i className="bi bi-check-circle-fill text-success fs-2 mb-2"></i>
                      <h5 className="card-title">{stats.resolved || 0}</h5>
                      <p className="card-text text-muted">تم الحل</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-2">
              <div className="d-flex gap-2">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="pending">في الانتظار</option>
                  <option value="in_progress">قيد المعالجة</option>
                  <option value="resolved">تم الحل</option>
                  <option value="closed">مغلقة</option>
                </select>
              </div>
              <form className="d-flex w-100" onSubmit={handleSearch}>
                <input
                  type="text"
                  className="form-control me-2"
                  placeholder="ابحث في الرسائل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  بحث
                </button>
              </form>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">جاري التحميل...</span>
                </div>
                <p className="mt-2">جاري تحميل الرسائل...</p>
              </div>
            ) : (
              <div className="table-responsive bg-white p-4 rounded-4 shadow-sm border">
                <table className="table table-hover table-bordered text-center align-middle mb-0 rounded-4 overflow-hidden">
                  <thead className="table-light text-dark fw-bold">
                    <tr>
                      <th>#</th>
                      <th>الاسم</th>
                      <th>البريد الإلكتروني</th>
                      <th>الهاتف</th>
                      <th>الرسالة</th>
                      <th>الحالة</th>
                      <th>تاريخ الإرسال</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.length > 0 ? (
                      messages.filter(msg => statusFilter === 'all' || msg.status === statusFilter).map((message, index) => (
                        <tr key={message.id}>
                          <td>{(currentPage - 1) * 10 + index + 1}</td>
                          <td className="fw-semibold">{message.name}</td>
                          <td>{message.email}</td>
                          <td>{message.country_code} {message.phone}</td>
                          <td>
                            <div style={{ maxWidth: "200px" }}>
                              {message.notes?.substring(0, 50)}
                              {message.notes?.length > 50 && '...'}
                              <br />
                              <button 
                                className="btn btn-sm btn-outline-primary mt-1"
                                style={{ color: "#fff" }}
                                onClick={() => openMessageModal(message)}
                              >
                                عرض كامل
                              </button>
                            </div>
                          </td>
                          <td>{getStatusBadge(message.status)}</td>
                          <td>{formatDate(message.created_at)}</td>
                          <td>
                            <div className="d-flex justify-content-center gap-2 flex-wrap">
                              <button
                                onClick={() => openMessageModal(message)}
                                className="btn btn-sm btn-primary"
                                title="عرض"
                              >
                                <i className="bi bi-eye"></i>
                              </button>
                              
                              <select
                                value={message.status}
                                onChange={(e) => handleStatusChange(message.id, e.target.value)}
                                className="form-select form-select-sm"
                                style={{ width: "auto", minWidth: "100px" }}
                              >
                                <option value="pending">في الانتظار</option>
                                <option value="in_progress">قيد المعالجة</option>
                                <option value="resolved">تم الحل</option>
                                <option value="closed">مغلقة</option>
                              </select>
                              
                              <button
                                onClick={() => handleDelete(message.id)}
                                className="btn btn-sm btn-danger"
                                title="حذف"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="text-center text-muted py-5"
                        >
                          <i className="bi bi-info-circle fs-4 text-primary mb-2"></i>
                          <p>لا توجد رسائل متاحة</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <nav className="mt-4" aria-label="Page navigation">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      السابق
                    </button>
                  </li>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <li
                        key={pageNum}
                        className={`page-item ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        setCurrentPage(prev => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      التالي
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showModal && selectedMessage && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ background: "#2c3e50", color: "white" }}>
                <h5 className="modal-title">تفاصيل الرسالة</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">الاسم:</label>
                    <p className="form-control-plaintext">{selectedMessage.name}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">البريد الإلكتروني:</label>
                    <p className="form-control-plaintext">{selectedMessage.email}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">رقم الهاتف:</label>
                    <p className="form-control-plaintext">{selectedMessage.country_code} {selectedMessage.phone}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">الحالة:</label>
                    <p className="form-control-plaintext">{getStatusBadge(selectedMessage.status)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">تاريخ الإرسال:</label>
                    <p className="form-control-plaintext">{formatDate(selectedMessage.created_at)}</p>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">الرسالة:</label>
                    <div className="border rounded p-3 bg-light">
                      {selectedMessage.notes}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <select
                  value={selectedMessage.status}
                  onChange={(e) => {
                    handleStatusChange(selectedMessage.id, e.target.value);
                    setSelectedMessage({...selectedMessage, status: e.target.value});
                  }}
                  className="form-select me-auto"
                  style={{ width: "auto" }}
                >
                  <option value="pending">في الانتظار</option>
                  <option value="in_progress">قيد المعالجة</option>
                  <option value="resolved">تم الحل</option>
                  <option value="closed">مغلقة</option>
                </select>
                
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactUs;
