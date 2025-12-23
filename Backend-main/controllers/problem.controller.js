const ProblemModel = require("../models/Problem");
const UserProgressModel = require("../models/UserProgress");
const { VM } = require('vm2');

// Get all problems with filters
const getProblems = async (req, res) => {
  try {
    const {
      category,
      difficulty,
      tag,
      company,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const filter = { status: 'published' };

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (tag) filter.tags = tag;
    if (company) filter.companies = company;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const problems = await ProblemModel.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-hiddenTestCases -solutions'); // Don't reveal solutions

    const count = await ProblemModel.countDocuments(filter);

    res.json({
      problems,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({ message: "Error fetching problems" });
  }
};

// Get single problem by slug
const getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const problem = await ProblemModel.findOne({ slug, status: 'published' })
      .populate('author', 'name email')
      .populate('relatedProblems', 'title slug difficulty')
      .populate('similarProblems', 'title slug difficulty')
      .select('-hiddenTestCases -solutions'); // Don't send solutions

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Increment view count
    problem.stats.views += 1;
    await problem.save();

    res.json(problem);
  } catch (error) {
    console.error("Error fetching problem:", error);
    res.status(500).json({ message: "Error fetching problem" });
  }
};

// Create new problem (instructor/admin only)
const createProblem = async (req, res) => {
  try {
    const problemData = {
      ...req.body,
      author: req.user._id
    };

    const problem = await ProblemModel.create(problemData);

    res.status(201).json({
      message: "Problem created successfully",
      problem
    });
  } catch (error) {
    console.error("Error creating problem:", error);
    res.status(500).json({ message: "Error creating problem", error: error.message });
  }
};

// Update problem
const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await ProblemModel.findById(id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (problem.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await ProblemModel.findByIdAndUpdate(id, req.body, { new: true });

    res.json({
      message: "Problem updated successfully",
      problem: updated
    });
  } catch (error) {
    console.error("Error updating problem:", error);
    res.status(500).json({ message: "Error updating problem" });
  }
};

// Delete problem
const deleteProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await ProblemModel.findById(id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (problem.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized" });
    }

    await ProblemModel.findByIdAndDelete(id);

    res.json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.error("Error deleting problem:", error);
    res.status(500).json({ message: "Error deleting problem" });
  }
};

// Submit solution to a problem
const submitSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, language } = req.body;
    const userId = req.user._id;

    if (!code || !language) {
      return res.status(400).json({ message: "Code and language are required" });
    }

    const problem = await ProblemModel.findById(id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Combine visible and hidden test cases
    const allTestCases = [
      ...problem.sampleTestCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.output,
        isHidden: false
      })),
      ...problem.hiddenTestCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.output,
        isHidden: true
      }))
    ];

    // Run test cases
    const result = await runTestCases(code, language, allTestCases);

    problem.stats.totalSubmissions += 1;

    const passed = result.status === 'accepted';

    if (passed) {
      problem.stats.successfulSubmissions += 1;

      // Update user progress
      let progress = await UserProgressModel.findOne({ user: userId });
      if (!progress) {
        progress = await UserProgressModel.create({ user: userId });
      }

      const alreadySolved = progress.problemsSolved.some(
        p => p.problem.toString() === id
      );

      if (!alreadySolved) {
        progress.problemsSolved.push({
          problem: id,
          language,
          code,
          attempts: 1
        });

        progress.totalPoints += problem.points;
        progress.updateStreak();

        progress.recentActivity.unshift({
          type: 'problem_solved',
          itemId: id,
          description: `Solved: ${problem.title}`
        });

        if (progress.recentActivity.length > 50) {
          progress.recentActivity = progress.recentActivity.slice(0, 50);
        }
      }

      await progress.save();
    }

    await problem.save();

    res.json({
      success: passed,
      passed,
      result: {
        status: result.status,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        runtime: result.runtime,
        testResults: result.testResults,
        message: result.message
      }
    });
  } catch (error) {
    console.error("Error submitting solution:", error);
    res.status(500).json({ message: "Error submitting solution" });
  }
};

// Bookmark/unbookmark problem
const toggleBookmarkProblem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    let progress = await UserProgressModel.findOne({ user: userId });
    if (!progress) {
      progress = await UserProgressModel.create({ user: userId });
    }

    const hasBookmarked = progress.bookmarkedProblems.some(
      b => b.problem.toString() === id
    );

    if (hasBookmarked) {
      progress.bookmarkedProblems = progress.bookmarkedProblems.filter(
        b => b.problem.toString() !== id
      );
    } else {
      progress.bookmarkedProblems.push({ problem: id });
    }

    await progress.save();

    res.json({
      message: hasBookmarked ? "Bookmark removed" : "Problem bookmarked",
      isBookmarked: !hasBookmarked
    });
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res.status(500).json({ message: "Error updating bookmark" });
  }
};

// Get problem hints one by one
const getProblemHint = async (req, res) => {
  try {
    const { id } = req.params;
    const { hintIndex } = req.query;

    const problem = await ProblemModel.findById(id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    const index = parseInt(hintIndex) || 0;

    if (index >= problem.hints.length) {
      return res.json({ hint: null, hasMore: false });
    }

    res.json({
      hint: problem.hints[index],
      hintNumber: index + 1,
      totalHints: problem.hints.length,
      hasMore: index + 1 < problem.hints.length
    });
  } catch (error) {
    console.error("Error fetching hint:", error);
    res.status(500).json({ message: "Error fetching hint" });
  }
};

// Run code against test cases
async function runTestCases(code, language, testCases) {
  const startTime = Date.now();
  let passedTests = 0;
  const testResults = [];

  try {
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];

      try {
        const result = await executeCode(code, language, testCase.input);
        const passed = result.trim() === testCase.expectedOutput.trim();

        if (passed) passedTests++;

        testResults.push({
          testNumber: i + 1,
          input: testCase.isHidden ? 'Hidden' : testCase.input,
          expectedOutput: testCase.isHidden ? 'Hidden' : testCase.expectedOutput,
          actualOutput: testCase.isHidden ? 'Hidden' : result,
          passed,
          isHidden: testCase.isHidden
        });

        if (!passed && !testCase.isHidden) {
          break; // Stop at first failing visible test
        }
      } catch (error) {
        testResults.push({
          testNumber: i + 1,
          input: testCase.isHidden ? 'Hidden' : testCase.input,
          expectedOutput: testCase.isHidden ? 'Hidden' : testCase.expectedOutput,
          actualOutput: 'Runtime Error',
          passed: false,
          error: error.message,
          isHidden: testCase.isHidden
        });

        return {
          status: 'runtime-error',
          passedTests,
          totalTests: testCases.length,
          runtime: Date.now() - startTime,
          testResults,
          message: `Runtime Error: ${error.message}`
        };
      }
    }

    const runtime = Date.now() - startTime;
    const status = passedTests === testCases.length ? 'accepted' : 'wrong-answer';

    return {
      status,
      passedTests,
      totalTests: testCases.length,
      runtime,
      testResults,
      message: status === 'accepted' ? 'All test cases passed!' : 'Some test cases failed'
    };
  } catch (error) {
    return {
      status: 'runtime-error',
      passedTests,
      totalTests: testCases.length,
      runtime: Date.now() - startTime,
      testResults,
      message: `Error: ${error.message}`
    };
  }
}

// Execute code in sandbox (JavaScript only for now)
async function executeCode(code, language, input) {
  if (language === 'javascript') {
    const vm = new VM({
      timeout: 3000,
      sandbox: {}
    });

    // Wrap code to capture console output
    const wrappedCode = `
      let output = '';
      const console = {
        log: (...args) => { output += args.join(' ') + '\\n'; }
      };
      
      ${code}
      
      // Try to call the main function if it exists
      if (typeof solution !== 'undefined') {
        const result = solution(${input});
        console.log(result);
      }
      
      output.trim();
    `;

    return vm.run(wrappedCode);
  } else {
    throw new Error(`Language ${language} is not supported yet. Currently only JavaScript is supported.`);
  }
}

module.exports = {
  getProblems,
  getProblemBySlug,
  createProblem,
  updateProblem,
  deleteProblem,
  submitSolution,
  toggleBookmarkProblem,
  getProblemHint
};
