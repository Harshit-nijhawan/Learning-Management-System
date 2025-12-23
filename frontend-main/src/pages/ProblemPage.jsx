import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  CheckCircle,
  TrendingUp,
  Clock,
  Settings,
  Youtube,
  BookOpen,
  Play
} from 'lucide-react';
import api from '../utils/api';

function ProblemPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [showHint, setShowHint] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const fetchProblem = useCallback(async () => {
    try {
      const response = await api.get(`/api/problems/${slug}`);
      setProblem(response.data);
    } catch (error) {
      console.error('Error fetching problem:', error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]);

  const handleBookmark = async () => {
    try {
      await api.post(`/api/problems/${problem._id}/bookmark`);
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error bookmarking:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'School': 'text-gray-600',
      'Basic': 'text-blue-600',
      'Easy': 'text-green-600',
      'Medium': 'text-yellow-600',
      'Hard': 'text-red-600'
    };
    return colors[difficulty] || 'text-gray-600';
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Problem Not Found</h1>
          <button
            onClick={() => navigate('/problems')}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Browse Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white text-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/problems')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Problem List</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-lg font-semibold text-gray-900">{problem.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBookmark}
            className={`p-2 rounded hover:bg-gray-100 transition ${isBookmarked ? 'text-yellow-500' : 'text-gray-600'
              }`}
          >
            {isBookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
          <button className="p-2 rounded hover:bg-gray-100 text-gray-600 transition">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="flex-1 flex overflow-hidden">
        {/* Full Width Problem Description */}
        <div className="w-full border-r border-gray-200 overflow-y-auto bg-white mx-auto max-w-4xl">
          <div className="p-6">
            {/* Problem Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className={`font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                <span className="text-gray-400">•</span>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm border border-gray-200">
                  {problem.category}
                </span>
                {problem.points && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600 text-sm flex items-center gap-1">
                      <TrendingUp size={14} />
                      {problem.points} pts
                    </span>
                  </>
                )}
              </div>

              {/* Acceptance Rate */}
              {problem.stats && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    Accepted: {problem.stats.successfulSubmissions || 0}
                  </span>
                  <span>
                    Submissions: {problem.stats.totalSubmissions || 0}
                  </span>
                  {problem.stats.totalSubmissions > 0 && (
                    <span className="text-green-600 font-medium">
                      {Math.round((problem.stats.successfulSubmissions / problem.stats.totalSubmissions) * 100)}% Acceptance
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 mb-6">
              {[
                { id: 'description', label: 'Description' },
                { id: 'solution', label: 'Solution (Video & Theory)' },
                { id: 'submissions', label: 'Submissions' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 font-medium transition ${activeTab === tab.id
                      ? 'text-green-600 border-b-2 border-green-600'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="space-y-6 text-gray-700">
                {/* Problem Statement */}
                <div>
                  <p className="whitespace-pre-wrap leading-relaxed">{problem.description}</p>
                </div>

                {/* Examples */}
                {problem.sampleTestCases && problem.sampleTestCases.map((tc, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="font-semibold mb-3 text-gray-900">Example {index + 1}:</div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Input:</div>
                        <pre className="bg-white border border-gray-200 p-3 rounded text-sm text-green-600 overflow-x-auto">
                          {tc.input}
                        </pre>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Output:</div>
                        <pre className="bg-white border border-gray-200 p-3 rounded text-sm text-blue-600 overflow-x-auto">
                          {tc.output}
                        </pre>
                      </div>
                      {tc.explanation && (
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Explanation:</div>
                          <p className="text-sm text-gray-700">{tc.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Constraints */}
                {problem.constraints && problem.constraints.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Constraints:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {problem.constraints.map((constraint, index) => (
                        <li key={index} className="text-gray-600">{constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Expected Complexity */}
                {problem.expectedComplexity && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Expected Complexity:</h3>
                    <div className="space-y-1 text-sm">
                      {problem.expectedComplexity.time && (
                        <div className="text-gray-700">
                          <span className="text-blue-600 font-medium">Time:</span> {problem.expectedComplexity.time}
                        </div>
                      )}
                      {problem.expectedComplexity.space && (
                        <div className="text-gray-700">
                          <span className="text-blue-600 font-medium">Space:</span> {problem.expectedComplexity.space}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Hints */}
                {problem.hints && problem.hints.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded border border-yellow-200 hover:bg-yellow-100 transition"
                    >
                      <Lightbulb size={18} />
                      {showHint ? 'Hide' : 'Show'} Hint
                    </button>
                    {showHint && (
                      <div className="mt-3 space-y-2">
                        {problem.hints.map((hint, index) => (
                          <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-sm text-gray-700">
                            <strong className="text-yellow-700">Hint {index + 1}:</strong> {hint}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                {problem.tags && problem.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {problem.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm border border-gray-300 hover:border-gray-400 cursor-pointer transition"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Companies */}
                {problem.companies && problem.companies.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Companies:</h3>
                    <div className="flex flex-wrap gap-2">
                      {problem.companies.map((company, index) => (
                        <span
                          key={index}
                          className="bg-green-50 text-green-700 px-3 py-1 rounded text-sm border border-green-200"
                        >
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Solution Tab (Video + Theory) */}
            {activeTab === 'solution' && (
              <div className="space-y-8">
                {/* Video Solution */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                    <Youtube className="text-red-600" />
                    Video Solution
                  </h3>
                  {problem.videoUrl ? (
                    <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden shadow-lg">
                      <iframe
                        src={getYouTubeEmbedUrl(problem.videoUrl)}
                        title="Video Solution"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-[400px] border-0"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                      <Play size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">Video solution coming soon.</p>
                    </div>
                  )}
                </div>

                {/* Theory Explanation */}
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                    <BookOpen className="text-blue-600" />
                    Theory & Approach
                  </h3>
                  {problem.theory ? (
                    <div className="prose prose-slate max-w-none bg-white p-6 rounded-lg border border-gray-200">
                      {/* Simple rendering for now, can use ReactMarkdown if added */}
                      <p className="whitespace-pre-wrap">{problem.theory}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                      <p className="text-gray-500">Detailed explanation coming soon.</p>
                      {/* Fallback to old solutions if available */}
                      {problem.solutions && problem.solutions.length > 0 && (
                        <div className="mt-4 text-left">
                          <p className="font-semibold mb-2">Community Solutions:</p>
                          {problem.solutions.map((sol, idx) => (
                            <div key={idx} className="bg-white p-4 rounded border border-gray-200 mb-2">
                              <p className="font-medium">{sol.approach}</p>
                              <p className="text-sm text-gray-600 mt-1">{sol.explanation}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="text-center py-12 text-gray-500">
                <Clock size={48} className="mx-auto mb-4 text-gray-400" />
                <p>Your submission history (Not available in read-only mode)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemPage;
