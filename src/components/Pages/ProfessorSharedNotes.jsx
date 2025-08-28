import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5001";

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

export default function ProfessorSharedNotes() {
  const PROFESSOR_ID = localStorage.getItem("userId");
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [expanded, setExpanded] = useState({});
  const [editedContent, setEditedContent] = useState({});
  console.log(PROFESSOR_ID);
  
  // Fetch all requests - Updated with professor authorization
  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/requests?professorId=${PROFESSOR_ID}`);
      console.log("📡 Raw fetch response:", res);
const data = await res.json();
console.log("📥 Parsed response data:", data);
      // const data = await res.json();
      // setRequests(data);
      // setRequests(data.requests || []); // ✅ This extracts the actual array
      const requestArray = data || []; // ✅ extracted safely
      setRequests(requestArray);
      
      
      // Calculate stats
      const stats = {
        pending: data.filter(r => r.status === "Pending").length,
        underReview: data.filter(r => r.status === "Under Review").length,
        approved: data.filter(r => r.status === "Approved").length,
        rejected: data.filter(r => r.status === "Rejected").length,
        total: data.length
      };
      setStats(stats);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    console.log("✅ All Requests received in state:", requests);
  }, [requests]);

  // Submit edited request function - Updated with professor authorization
  const submitEditedRequest = async (id) => {
    const editedContentValue = editedContent[id];
    
    if (!editedContentValue || !editedContentValue.trim()) {
      alert("Please provide edited content before approving.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/requests/${id}?professorId=${PROFESSOR_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: editedContentValue.trim(),
          status: "Approved",
          editedByProfessor: true,
          reviewMessage: "Content edited and approved by professor"
        })
      });

      if (response.ok) {
        alert("Student message edited and approved.");
        setEditedContent(prev => ({ ...prev, [id]: '' }));
        fetchRequests();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to submit edited message.");
      }
    } catch (error) {
      console.error("Error submitting edited message:", error);
    }
  };

  // Mark as under review function - WITH PROMPT FOR REVIEW MESSAGE (ONLY THIS FUNCTION HAS PROMPT)
  const markUnderReview = async (id) => {
    try {
      // Prompt for review message
      const reviewMessage = prompt("Please enter a review message for the student:");
      
      // If user cancels or enters empty message, don't proceed
      if (reviewMessage === null) {
        return; // User cancelled
      }
      
      // Use default message if empty
      const finalReviewMessage = reviewMessage.trim() || "Marked for review by professor";
      
      const response = await fetch(`${API_URL}/requests/${id}?professorId=${PROFESSOR_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Under Review",
          reviewMessage: finalReviewMessage
        })
      });

      if (response.ok) {
        alert("Marked as Under Review with your message.");
        fetchRequests();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error marking as under review.");
      }
    } catch (error) {
      console.error("Error marking as under review:", error);
    }
  };

  // Reject request function - REMOVED PROMPT
  const rejectRequest = async (id) => {
    try {
      const response = await fetch(`${API_URL}/requests/${id}?professorId=${PROFESSOR_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Rejected",
          reviewMessage: "Request rejected by professor"
        })
      });

      if (response.ok) {
        fetchRequests();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error rejecting request.");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  // Approve request function - REMOVED PROMPT
  const approveRequest = async (id) => {
    try {
      const payload = { status: "Approved" };
      
      // Add edited content if provided
      if (editedContent[id]) {
        payload.content = editedContent[id];
        payload.editedByProfessor = true;
      }

      const response = await fetch(`${API_URL}/requests/${id}?professorId=${PROFESSOR_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setEditedContent(prev => ({ ...prev, [id]: '' }));
        fetchRequests();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error approving request.");
      }
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const toggleDetails = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter requests based on active tab
  // const getFilteredRequests = () => {
  //   switch(activeTab) {
  //     case 'pending':
  //       return requests.filter(r => r.status === "Pending");
  //     case 'underReview':
  //       return requests.filter(r => r.status === "Under Review");
  //     case 'processed':
  //       return requests.filter(r => r.status === "Approved" || r.status === "Rejected");
  //     default:
  //       return [];
  //   }
  // };
  const getFilteredRequests = () => {
    if (!Array.isArray(requests)) return [];
  
    switch (activeTab) {
      case 'pending':
        return requests.filter(r => r.status === "Pending");
      case 'underReview':
        return requests.filter(r => r.status === "Under Review");
      case 'processed':
        return requests.filter(r => r.status === "Approved" || r.status === "Rejected");
      default:
        return [];
    }
  };
  

  const filteredRequests = getFilteredRequests();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#181C27] to-[#1a1f2e] py-4 px-3 sm:py-6 sm:px-4">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
            Professor Dashboard
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage student shared note requests for your courses</p>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-6">
          <div className="bg-gradient-to-br from-[#23283A] to-[#2A2F42] rounded-lg sm:rounded-xl p-2 sm:p-4 border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <div className="p-1 sm:p-2 bg-yellow-400/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-400 rotate-[-90] origin-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-yellow-400 text-center">{stats.pending || 0}</div>
            <div className="text-gray-300 text-xs sm:text-sm font-medium text-center">Pending</div>
          </div>

          <div className="bg-gradient-to-br from-[#23283A] to-[#2A2F42] rounded-lg sm:rounded-xl p-2 sm:p-4 border border-gray-700/50 hover:border-orange-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <div className="p-1 sm:p-2 bg-orange-400/10 rounded-lg flex items-center justify-center">
                <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-orange-400 text-center">{stats.underReview || 0}</div>
            <div className="text-gray-300 text-xs sm:text-sm font-medium text-center">Review</div>
          </div>

          <div className="bg-gradient-to-br from-[#23283A] to-[#2A2F42] rounded-lg sm:rounded-xl p-2 sm:p-4 border border-gray-700/50 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <div className="p-1 sm:p-2 bg-green-400/10 rounded-lg flex items-center justify-center">
                <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-green-400 text-center">{stats.approved || 0}</div>
            <div className="text-gray-300 text-xs sm:text-sm font-medium text-center">Approved</div>
          </div>

          <div className="bg-gradient-to-br from-[#23283A] to-[#2A2F42] rounded-lg sm:rounded-xl p-2 sm:p-4 border border-gray-700/50 hover:border-red-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <div className="p-1 sm:p-2 bg-red-400/10 rounded-lg flex items-center justify-center">
                <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-red-400 text-center">{stats.rejected || 0}</div>
            <div className="text-gray-300 text-xs sm:text-sm font-medium text-center">Rejected</div>
          </div>

          <div className="bg-gradient-to-br from-[#23283A] to-[#2A2F42] rounded-lg sm:rounded-xl p-2 sm:p-4 border border-gray-700/50 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-center mb-1 sm:mb-2">
              <div className="p-1 sm:p-2 bg-blue-400/10 rounded-lg flex items-center justify-center">
                <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-bold text-blue-400 text-center">{stats.total || 0}</div>
            <div className="text-gray-300 text-xs sm:text-sm font-medium text-center">Total</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-6">
          <button
            className={`inline-flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'pending' 
                ? 'bg-gradient-to-r from-orange-400 to-yellow-400 text-[#181C27] shadow-lg shadow-orange-400/25 scale-105' 
                : 'bg-[#23283A] text-white hover:bg-[#2A2F42] border border-gray-700/50 hover:border-orange-400/50'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            <span className="hidden sm:inline">Pending </span>({stats.pending || 0})
          </button>
          
          <button
            className={`inline-flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'underReview' 
                ? 'bg-gradient-to-r from-orange-400 to-yellow-400 text-[#181C27] shadow-lg shadow-orange-400/25 scale-105' 
                : 'bg-[#23283A] text-white hover:bg-[#2A2F42] border border-gray-700/50 hover:border-orange-400/50'
            }`}
            onClick={() => setActiveTab('underReview')}
          >
            <span className="hidden sm:inline">Review </span>({stats.underReview || 0})
          </button>
          
          <button
            className={`inline-flex items-center justify-center gap-1 sm:gap-2 px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
              activeTab === 'processed' 
                ? 'bg-gradient-to-r from-orange-400 to-yellow-400 text-[#181C27] shadow-lg shadow-orange-400/25 scale-105' 
                : 'bg-[#23283A] text-white hover:bg-[#2A2F42] border border-gray-700/50 hover:border-orange-400/50'
            }`}
            onClick={() => setActiveTab('processed')}
          >
            <span className="hidden sm:inline">Processed </span>({(stats.approved || 0) + (stats.rejected || 0)})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#23283A] to-[#2A2F42] rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white inline-flex items-center gap-2">
              <div className="p-1 sm:p-2 bg-orange-400/10 rounded-lg flex items-center justify-center">
                <svg className="rotate-[-90] w-4 h-4 sm:w-6 sm:h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="hidden sm:inline">
                {activeTab === 'pending' && 'Pending Requests'}
                {activeTab === 'underReview' && 'Under Review'}
                {activeTab === 'processed' && 'Processed Requests'}
              </span>
              <span className="sm:hidden">
                {activeTab === 'pending' && 'Pending'}
                {activeTab === 'underReview' && 'Review'}
                {activeTab === 'processed' && 'Processed'}
              </span>
            </h2>
            <div className="text-xs sm:text-sm text-gray-400 bg-[#181C27] px-2 py-1 sm:px-3 sm:py-2 rounded-lg">
              {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-700/20 rounded-full flex items-center justify-center">
                <svg className="rotate-[-90] w-8 h-8 sm:w-10 sm:h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-gray-400 text-lg sm:text-xl mb-2">
                {activeTab === 'pending' && 'No pending requests for your courses'}
                {activeTab === 'underReview' && 'No requests under review for your courses'}
                {activeTab === 'processed' && 'No processed requests for your courses'}
              </div>
              <div className="text-gray-500 text-sm">
                You can only see shared note requests for courses you created.
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="bg-gradient-to-br from-[#181C27] to-[#1a1f2e] rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-600/50 hover:border-orange-400/50 transition-all duration-300">
                  {/* Request Header */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="p-1.5 sm:p-2 bg-orange-400/10 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-lg font-bold text-orange-300 truncate">{request.course}</h3>
                          <p className="text-gray-300 text-xs sm:text-base mb-1 sm:mb-2 line-clamp-1">{request.videoName}</p>
                          <div className="flex flex-wrap gap-1 sm:gap-2 text-xs text-gray-400 mb-2">
                            <span className="inline-flex items-center gap-1">
                              <svg className="rotate-[-90] w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="truncate max-w-[100px] sm:max-w-none">{request.studentName}</span>
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <svg className="rotate-[-90] w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="hidden sm:inline">{formatTime(request.timestamp)}</span>
                              <span className="sm:hidden">{new Date(request.timestamp).toLocaleDateString()}</span>
                            </span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                            request.status === 'Pending' ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' :
                            request.status === 'Under Review' ? 'bg-orange-400/20 text-orange-400 border border-orange-400/30' :
                            request.status === 'Approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 text-xs sm:text-sm font-semibold"
                      onClick={() => toggleDetails(request.id)}
                    >
                      {expanded[request.id] ? 'Hide' : 'Review'}
                    </button>
                  </div>

                  {/* Student Message */}
                  <div className="bg-gradient-to-br from-[#23283A] to-[#2A2F42] rounded-lg p-3 sm:p-4 mb-3 border border-gray-600/30">
                    <h4 className="font-bold text-orange-300 mb-2 text-xs sm:text-sm inline-flex items-center gap-1 sm:gap-2">
                      <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Student's Note Request:
                    </h4>
                    <p className="text-gray-200 text-xs sm:text-sm leading-relaxed bg-[#181C27] p-2 sm:p-3 rounded-lg">{request.content}</p>
                  </div>

                  {/* Professor Review Message */}
                  {request.reviewMessage && (
                    <div className="bg-gradient-to-br from-orange-400/10 to-yellow-400/10 rounded-lg p-3 sm:p-4 mb-3 border border-orange-400/30">
                      <h4 className="font-bold text-orange-300 mb-2 text-xs sm:text-sm inline-flex items-center gap-1 sm:gap-2">
                        <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Professor's Review:
                      </h4>
                      <p className="text-gray-200 text-xs sm:text-sm">{request.reviewMessage}</p>
                    </div>
                  )}

                  {/* Expanded Details */}
                  {expanded[request.id] && (
                    <div className="space-y-3 sm:space-y-4 border-t border-gray-600/30 pt-3 sm:pt-4">
                      {/* Edit Content Section */}
                      {(activeTab === 'pending' || activeTab === 'underReview') && (
                        <div>
                          <label className="block text-orange-300 font-bold mb-2 text-xs sm:text-sm inline-flex items-center gap-1 sm:gap-2">
                            <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Student Message (Optional):
                          </label>
                          <textarea
                            className="w-full bg-[#23283A] border border-gray-600/50 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none text-xs sm:text-sm"
                            rows="3"
                            defaultValue={request.content}
                            onChange={(e) => setEditedContent(prev => ({
                              ...prev,
                              [request.id]: e.target.value
                            }))}
                          />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        {activeTab === 'pending' && (
                          <>
                            <button
                              className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 text-xs sm:text-sm font-bold"
                              onClick={() => approveRequest(request.id)}
                            >
                              <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-xs sm:text-sm font-bold"
                              onClick={() => markUnderReview(request.id)}
                            >
                              <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                              </svg>
                              <span className="hidden sm:inline">Mark </span>Review
                            </button>
                            <button
                              className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 text-xs sm:text-sm font-bold"
                              onClick={() => rejectRequest(request.id)}
                            >
                              <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </>
                        )}

                        {activeTab === 'underReview' && (
                          <>
                            <button
                              className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 text-xs sm:text-sm font-bold"
                              onClick={() => submitEditedRequest(request.id)}
                            >
                              <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="hidden sm:inline">Approve </span>Edited
                            </button>
                            <button
                              className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 text-xs sm:text-sm font-bold"
                              onClick={() => rejectRequest(request.id)}
                            >
                              <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </>
                        )}

                        {activeTab === 'processed' && (
                          <>
                            <button
                              className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 text-xs sm:text-sm font-bold"
                              onClick={() => approveRequest(request.id)}
                            >
                              <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 text-xs sm:text-sm font-bold"
                              onClick={() => rejectRequest(request.id)}
                            >
                              <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                            <button
                              className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-xs sm:text-sm font-bold"
                              onClick={() => markUnderReview(request.id)}
                            >
                              <svg className="rotate-[-90] w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                              </svg>
                              Review
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
