import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Trophy, Flame, CheckCircle, Loader, Calendar, Youtube, BookOpen, Play } from 'lucide-react';
import api from '../utils/api';

const DailyQuestion = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetchTodaysQuestion();
    fetchUserStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTodaysQuestion = async () => {
    try {
      const response = await api.get('/api/daily-question/today');
      const questionData = response.data.question;
      setQuestion(questionData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching daily question:', error);
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/api/daily-question/my-stats');
      setUserStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading today's challenge...</p>
          </div>
        </div>
      </>
    );
  }

  if (!question) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Question Available</h2>
            <p className="text-gray-600 mb-6">Check back tomorrow for a new challenge!</p>
            <button
              onClick={() => navigate('/problems')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Problems
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Stats Header */}
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Daily Coding Challenge</h1>
                <p className="text-sm text-gray-600">
                  {new Date(question.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {userStats && (
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-orange-600 mb-1">
                      <Flame size={20} />
                      <span className="text-2xl font-bold">{userStats.currentStreak}</span>
                    </div>
                    <p className="text-xs text-gray-600">Day Streak</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                      <Trophy size={20} />
                      <span className="text-2xl font-bold">{userStats.solvedCount}</span>
                    </div>
                    <p className="text-xs text-gray-600">Solved</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-green-600 mb-1">
                      <CheckCircle size={20} />
                      <span className="text-2xl font-bold">{userStats.maxStreak}</span>
                    </div>
                    <p className="text-xs text-gray-600">Max Streak</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Question Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{question.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className="text-sm text-gray-600">
                      Acceptance: {question.acceptanceRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <div className="flex gap-4">
                  {['description', 'examples', 'hints', 'solution'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 px-1 font-semibold text-sm border-b-2 transition-colors capitalize ${activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      {tab === 'solution' ? 'Solution (Video)' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="overflow-y-auto">
                {activeTab === 'description' && (
                  <div>
                    <div className="prose prose-sm max-w-none mb-6">
                      <p className="text-gray-700 whitespace-pre-wrap">{question.description}</p>
                    </div>

                    {question.constraints && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Constraints:</h3>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{question.constraints}</p>
                      </div>
                    )}

                    {question.tags && question.tags.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Tags:</h3>
                        <div className="flex flex-wrap gap-2">
                          {question.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'examples' && (
                  <div className="space-y-4">
                    {question.examples && question.examples.map((example, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-semibold text-gray-900 mb-2">Example {index + 1}:</p>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-semibold text-gray-700">Input:</span>
                            <pre className="mt-1 bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                              {example.input}
                            </pre>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Output:</span>
                            <pre className="mt-1 bg-white p-2 rounded border border-gray-200 overflow-x-auto">
                              {example.output}
                            </pre>
                          </div>
                          {example.explanation && (
                            <div>
                              <span className="font-semibold text-gray-700">Explanation:</span>
                              <p className="mt-1 text-gray-600">{example.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'hints' && (
                  <div className="space-y-3">
                    {question.hints && question.hints.length > 0 ? (
                      question.hints.map((hint, index) => (
                        <div key={index} className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Hint {index + 1}:</span> {hint}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600 text-sm">No hints available for this problem.</p>
                    )}
                  </div>
                )}

                {/* Solution Tab */}
                {activeTab === 'solution' && (
                  <div className="space-y-8">
                    {/* Video Solution */}
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
                        <Youtube className="text-red-600" />
                        Video Solution
                      </h3>
                      {question.videoUrl ? (
                        <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden shadow-lg">
                          <iframe
                            src={getYouTubeEmbedUrl(question.videoUrl)}
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
                      {question.theory ? (
                        <div className="prose prose-slate max-w-none bg-white p-6 rounded-lg border border-gray-200">
                          <p className="whitespace-pre-wrap">{question.theory}</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                          <p className="text-gray-500">Detailed explanation coming soon.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DailyQuestion;
