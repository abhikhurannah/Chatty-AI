import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, Brain, MessageSquare, TrendingUp, X, Lightbulb, 
  Activity, Target, Users, Sparkles, RefreshCw 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIStore } from "@/stores/useAIStore";
import { useChatStore } from "@/stores/useChatStore";
import { Progress } from "@/components/ui/progress";

interface AIAnalysisProps {
  selectedUserId: string;
  userName: string;
  isVisible: boolean;
  onClose: () => void;
}

export const AIAnalysis = ({ selectedUserId, userName, isVisible, onClose }: AIAnalysisProps) => {
  const { analysis, isLoadingAnalysis, analyzeConversation } = useAIStore();
  const { messages } = useChatStore();
  const [hasLoaded, setHasLoaded] = useState(false);

  const handleAnalyze = async () => {
    await analyzeConversation(selectedUserId, messages);
    setHasLoaded(true);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'neutral': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800';
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone?.toLowerCase()) {
      case 'casual': return 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800';
      case 'formal': return 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800';
      case 'friendly': return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'professional': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800';
    }
  };

  const getSentimentScore = (sentiment: string): number => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 85;
      case 'negative': return 35;
      case 'neutral': return 60;
      default: return 50;
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
        >
          <Card className="bg-card/95 backdrop-blur-lg border border-purple-200/20 shadow-2xl">
            <CardHeader className="border-b border-border bg-gradient-to-r from-purple-500/10 to-blue-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Brain className="h-5 w-5 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-lg">Conversation Analysis</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      AI-powered insights for {userName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasLoaded && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleAnalyze}
                      disabled={isLoadingAnalysis}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingAnalysis ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={onClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-6 space-y-6">
                  {!hasLoaded && !isLoadingAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0] 
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <BarChart3 className="h-20 w-20 text-purple-500 mx-auto mb-4 opacity-50" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        Analyze Your Conversation
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Get AI-powered insights about sentiment, tone, conversation patterns, and personalized suggestions
                      </p>
                      <Button 
                        onClick={handleAnalyze} 
                        size="lg"
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90"
                      >
                        <Brain className="h-5 w-5 mr-2" />
                        Start AI Analysis
                      </Button>
                      <p className="text-xs text-muted-foreground mt-4">
                        {messages.length} messages available for analysis
                      </p>
                    </motion.div>
                  )}

                  {isLoadingAnalysis && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <div className="relative w-20 h-20 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-purple-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                        <Brain className="absolute inset-0 m-auto h-8 w-8 text-purple-500" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Analyzing Conversation...
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        AI is processing {messages.length} messages and generating insights
                      </p>
                      <div className="max-w-md mx-auto space-y-3">
                        {['Analyzing sentiment patterns...', 'Detecting conversation tone...', 'Identifying key topics...', 'Generating suggestions...'].map((step, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.5 }}
                            className="flex items-center gap-3 text-sm text-muted-foreground"
                          >
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                            {step}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {analysis && !isLoadingAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      {/* Overview Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <Activity className="h-8 w-8 text-green-600 dark:text-green-400" />
                            <div>
                              <p className="text-xs text-green-600 dark:text-green-400 font-medium">Messages</p>
                              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{messages.length}</p>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-3">
                            <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            <div>
                              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Topics</p>
                              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                                {analysis.topics?.length || 0}
                              </p>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Engagement</p>
                              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">High</p>
                            </div>
                          </div>
                        </Card>
                      </div>

                      {/* Sentiment & Tone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5 text-purple-500" />
                            <span className="text-sm font-semibold">Sentiment Analysis</span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant="outline" 
                                className={`${getSentimentColor(analysis.sentiment)} font-medium text-sm px-3 py-1`}
                              >
                                {analysis.sentiment}
                              </Badge>
                              <span className="text-lg font-bold text-foreground">
                                {getSentimentScore(analysis.sentiment)}%
                              </span>
                            </div>
                            <Progress value={getSentimentScore(analysis.sentiment)} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              Overall conversation sentiment based on message analysis
                            </p>
                          </div>
                        </Card>

                        <Card className="p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-semibold">Conversation Tone</span>
                          </div>
                          <div className="space-y-3">
                            <Badge 
                              variant="outline"
                              className={`${getToneColor(analysis.tone)} font-medium text-sm px-3 py-1`}
                            >
                              {analysis.tone}
                            </Badge>
                            {analysis.conversationStyle && (
                              <p className="text-sm text-muted-foreground">
                                Style: <span className="font-medium text-foreground">{analysis.conversationStyle}</span>
                              </p>
                            )}
                            {analysis.emotionalTone && (
                              <p className="text-sm text-muted-foreground">
                                Emotional: <span className="font-medium text-foreground">{analysis.emotionalTone}</span>
                              </p>
                            )}
                          </div>
                        </Card>
                      </div>

                      {/* Topics */}
                      {analysis.topics && analysis.topics.length > 0 && (
                        <Card className="p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <Brain className="h-5 w-5 text-indigo-500" />
                            <span className="text-sm font-semibold">Key Topics Discussed</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {analysis.topics.map((topic, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <Badge 
                                  variant="secondary" 
                                  className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800 px-3 py-1"
                                >
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  {topic}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </Card>
                      )}

                      {/* AI Suggestions */}
                      {analysis.suggestions && analysis.suggestions.length > 0 && (
                        <Card className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                              AI-Powered Suggestions
                            </span>
                          </div>
                          <div className="space-y-3">
                            {analysis.suggestions.map((suggestion, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 bg-white dark:bg-gray-900 border border-yellow-200 dark:border-yellow-800 rounded-lg shadow-sm"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">
                                      {index + 1}
                                    </span>
                                  </div>
                                  <p className="text-sm text-foreground flex-1 leading-relaxed">{suggestion}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </Card>
                      )}
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};