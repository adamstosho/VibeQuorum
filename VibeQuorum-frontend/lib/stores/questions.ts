// Question and Answer data store using localStorage for MVP
// In production, this would be replaced with backend API calls

export interface Question {
  id: string
  title: string
  description: string
  tags: string[]
  author: string
  displayName?: string
  status: 'open' | 'answered' | 'closed'
  acceptedAnswerId?: string
  votesCount: number
  answersCount: number
  viewsCount: number
  createdAt: string
  updatedAt: string
}

export interface Answer {
  id: string
  questionId: string
  author: string
  displayName?: string
  content: string
  upvotes: number
  downvotes: number
  aiGenerated: boolean
  isAccepted: boolean
  txHashes: string[]
  vibeReward: number
  createdAt: string
}

export interface Vote {
  id: string
  voter: string
  targetType: 'question' | 'answer'
  targetId: string
  value: 1 | -1
  createdAt: string
}

const QUESTIONS_KEY = 'vibequorum_questions'
const ANSWERS_KEY = 'vibequorum_answers'
const VOTES_KEY = 'vibequorum_votes'

// Helper to check if we're on client side
const isClient = typeof window !== 'undefined'

// Question Store
export const questionStore = {
  getAll: (): Question[] => {
    if (!isClient) return []
    try {
      const data = localStorage.getItem(QUESTIONS_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  getById: (id: string): Question | null => {
    const questions = questionStore.getAll()
    return questions.find(q => q.id === id) || null
  },

  getByAuthor: (author: string): Question[] => {
    const questions = questionStore.getAll()
    return questions.filter(q => q.author.toLowerCase() === author.toLowerCase())
  },

  search: (query: string, tags: string[] = [], status?: string, sortBy: string = 'newest'): Question[] => {
    let questions = questionStore.getAll()
    
    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase()
      questions = questions.filter(q => 
        q.title.toLowerCase().includes(lowerQuery) ||
        q.description.toLowerCase().includes(lowerQuery)
      )
    }
    
    // Filter by tags
    if (tags.length > 0) {
      questions = questions.filter(q => 
        tags.some(tag => q.tags.includes(tag))
      )
    }
    
    // Filter by status
    if (status && status !== 'all') {
      questions = questions.filter(q => q.status === status)
    }
    
    // Sort
    switch (sortBy) {
      case 'newest':
        questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'trending':
      case 'votes':
        questions.sort((a, b) => b.votesCount - a.votesCount)
        break
      case 'active':
        questions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
      case 'unanswered':
        questions = questions.filter(q => q.answersCount === 0)
        questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }
    
    return questions
  },

  create: (data: {
    title: string
    description: string
    tags: string[]
    author: string
    displayName?: string
  }): Question => {
    if (!isClient) throw new Error('Cannot create question on server')
    
    const questions = questionStore.getAll()
    const newQuestion: Question = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      description: data.description,
      tags: data.tags,
      author: data.author,
      displayName: data.displayName,
      status: 'open',
      votesCount: 0,
      answersCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    questions.unshift(newQuestion)
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions))
    return newQuestion
  },

  update: (id: string, updates: Partial<Question>): Question | null => {
    if (!isClient) return null
    
    const questions = questionStore.getAll()
    const index = questions.findIndex(q => q.id === id)
    if (index === -1) return null
    
    questions[index] = {
      ...questions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions))
    return questions[index]
  },

  incrementViews: (id: string): void => {
    const question = questionStore.getById(id)
    if (question) {
      questionStore.update(id, { viewsCount: question.viewsCount + 1 })
    }
  },

  delete: (id: string): boolean => {
    if (!isClient) return false
    
    const questions = questionStore.getAll()
    const filtered = questions.filter(q => q.id !== id)
    if (filtered.length === questions.length) return false
    
    localStorage.setItem(QUESTIONS_KEY, JSON.stringify(filtered))
    
    // Also delete related answers
    const answers = answerStore.getAll()
    const filteredAnswers = answers.filter(a => a.questionId !== id)
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(filteredAnswers))
    
    return true
  },
}

// Answer Store
export const answerStore = {
  getAll: (): Answer[] => {
    if (!isClient) return []
    try {
      const data = localStorage.getItem(ANSWERS_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  getByQuestionId: (questionId: string): Answer[] => {
    const answers = answerStore.getAll()
    return answers
      .filter(a => a.questionId === questionId)
      .sort((a, b) => {
        // Accepted answer first
        if (a.isAccepted && !b.isAccepted) return -1
        if (!a.isAccepted && b.isAccepted) return 1
        // Then by upvotes
        return b.upvotes - a.upvotes
      })
  },

  getByAuthor: (author: string): Answer[] => {
    const answers = answerStore.getAll()
    return answers.filter(a => a.author.toLowerCase() === author.toLowerCase())
  },

  getById: (id: string): Answer | null => {
    const answers = answerStore.getAll()
    return answers.find(a => a.id === id) || null
  },

  create: (data: {
    questionId: string
    author: string
    displayName?: string
    content: string
    aiGenerated: boolean
  }): Answer => {
    if (!isClient) throw new Error('Cannot create answer on server')
    
    const answers = answerStore.getAll()
    const newAnswer: Answer = {
      id: `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questionId: data.questionId,
      author: data.author,
      displayName: data.displayName,
      content: data.content,
      aiGenerated: data.aiGenerated,
      upvotes: 0,
      downvotes: 0,
      isAccepted: false,
      txHashes: [],
      vibeReward: 0,
      createdAt: new Date().toISOString(),
    }
    
    answers.unshift(newAnswer)
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
    
    // Update question answer count and status
    const question = questionStore.getById(data.questionId)
    if (question) {
      questionStore.update(data.questionId, {
        answersCount: question.answersCount + 1,
        status: question.status === 'open' ? 'answered' : question.status,
      })
    }
    
    return newAnswer
  },

  update: (id: string, updates: Partial<Answer>): Answer | null => {
    if (!isClient) return null
    
    const answers = answerStore.getAll()
    const index = answers.findIndex(a => a.id === id)
    if (index === -1) return null
    
    answers[index] = {
      ...answers[index],
      ...updates,
    }
    
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
    return answers[index]
  },

  upvote: (id: string): Answer | null => {
    const answer = answerStore.getById(id)
    if (!answer) return null
    return answerStore.update(id, { upvotes: answer.upvotes + 1 })
  },

  downvote: (id: string): Answer | null => {
    const answer = answerStore.getById(id)
    if (!answer) return null
    return answerStore.update(id, { downvotes: answer.downvotes + 1 })
  },

  accept: (id: string, txHash?: string, vibeReward?: number): Answer | null => {
    if (!isClient) return null
    
    const answers = answerStore.getAll()
    const answerIndex = answers.findIndex(a => a.id === id)
    if (answerIndex === -1) return null
    
    const answer = answers[answerIndex]
    
    // Unaccept other answers for the same question
    answers.forEach((a, i) => {
      if (a.questionId === answer.questionId && a.id !== id) {
        answers[i].isAccepted = false
      }
    })
    
    // Accept this answer
    answers[answerIndex] = {
      ...answer,
      isAccepted: true,
      txHashes: txHash ? [...answer.txHashes, txHash] : answer.txHashes,
      vibeReward: vibeReward || answer.vibeReward,
    }
    
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
    
    // Update question status
    questionStore.update(answer.questionId, {
      acceptedAnswerId: id,
      status: 'closed',
    })
    
    return answers[answerIndex]
  },

  addTxHash: (id: string, txHash: string, vibeReward: number): Answer | null => {
    const answer = answerStore.getById(id)
    if (!answer) return null
    
    return answerStore.update(id, {
      txHashes: [...answer.txHashes, txHash],
      vibeReward: answer.vibeReward + vibeReward,
    })
  },

  delete: (id: string): boolean => {
    if (!isClient) return false
    
    const answers = answerStore.getAll()
    const answer = answers.find(a => a.id === id)
    if (!answer) return false
    
    const filtered = answers.filter(a => a.id !== id)
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(filtered))
    
    // Update question answer count
    const question = questionStore.getById(answer.questionId)
    if (question) {
      questionStore.update(answer.questionId, {
        answersCount: Math.max(0, question.answersCount - 1),
        acceptedAnswerId: question.acceptedAnswerId === id ? undefined : question.acceptedAnswerId,
      })
    }
    
    return true
  },
}

// Vote Store
export const voteStore = {
  getAll: (): Vote[] => {
    if (!isClient) return []
    try {
      const data = localStorage.getItem(VOTES_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  getUserVote: (voter: string, targetType: 'question' | 'answer', targetId: string): Vote | null => {
    const votes = voteStore.getAll()
    return votes.find(v => 
      v.voter.toLowerCase() === voter.toLowerCase() &&
      v.targetType === targetType &&
      v.targetId === targetId
    ) || null
  },

  vote: (data: {
    voter: string
    targetType: 'question' | 'answer'
    targetId: string
    value: 1 | -1
  }): { vote: Vote; isNew: boolean } => {
    if (!isClient) throw new Error('Cannot vote on server')
    
    const votes = voteStore.getAll()
    const existingVote = voteStore.getUserVote(data.voter, data.targetType, data.targetId)
    
    if (existingVote) {
      // Update existing vote
      const index = votes.findIndex(v => v.id === existingVote.id)
      const oldValue = votes[index].value
      votes[index].value = data.value
      localStorage.setItem(VOTES_KEY, JSON.stringify(votes))
      
      // Update target vote count
      if (data.targetType === 'question') {
        const question = questionStore.getById(data.targetId)
        if (question) {
          questionStore.update(data.targetId, {
            votesCount: question.votesCount - oldValue + data.value,
          })
        }
      } else {
        const answer = answerStore.getById(data.targetId)
        if (answer) {
          if (oldValue === 1) {
            answerStore.update(data.targetId, {
              upvotes: answer.upvotes - 1 + (data.value === 1 ? 1 : 0),
              downvotes: answer.downvotes + (data.value === -1 ? 1 : 0),
            })
          } else {
            answerStore.update(data.targetId, {
              upvotes: answer.upvotes + (data.value === 1 ? 1 : 0),
              downvotes: answer.downvotes - 1 + (data.value === -1 ? 1 : 0),
            })
          }
        }
      }
      
      return { vote: votes[index], isNew: false }
    }
    
    // Create new vote
    const newVote: Vote = {
      id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      voter: data.voter,
      targetType: data.targetType,
      targetId: data.targetId,
      value: data.value,
      createdAt: new Date().toISOString(),
    }
    
    votes.push(newVote)
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes))
    
    // Update target vote count
    if (data.targetType === 'question') {
      const question = questionStore.getById(data.targetId)
      if (question) {
        questionStore.update(data.targetId, {
          votesCount: question.votesCount + data.value,
        })
      }
    } else {
      const answer = answerStore.getById(data.targetId)
      if (answer) {
        answerStore.update(data.targetId, {
          upvotes: answer.upvotes + (data.value === 1 ? 1 : 0),
          downvotes: answer.downvotes + (data.value === -1 ? 1 : 0),
        })
      }
    }
    
    return { vote: newVote, isNew: true }
  },

  removeVote: (voter: string, targetType: 'question' | 'answer', targetId: string): boolean => {
    if (!isClient) return false
    
    const votes = voteStore.getAll()
    const vote = voteStore.getUserVote(voter, targetType, targetId)
    if (!vote) return false
    
    const filtered = votes.filter(v => v.id !== vote.id)
    localStorage.setItem(VOTES_KEY, JSON.stringify(filtered))
    
    // Update target vote count
    if (targetType === 'question') {
      const question = questionStore.getById(targetId)
      if (question) {
        questionStore.update(targetId, {
          votesCount: question.votesCount - vote.value,
        })
      }
    } else {
      const answer = answerStore.getById(targetId)
      if (answer) {
        answerStore.update(targetId, {
          upvotes: answer.upvotes - (vote.value === 1 ? 1 : 0),
          downvotes: answer.downvotes - (vote.value === -1 ? 1 : 0),
        })
      }
    }
    
    return true
  },
}

// Seed initial data for demo - DISABLED: Use real API data only
export const seedDemoData = () => {
  // Disabled - no mock data, use real API data only
  return
  
  const demoQuestions: Question[] = [
    {
      id: 'q_demo_1',
      title: 'Why does my ERC20 transfer revert on Goerli testnet?',
      description: `I'm implementing an ERC20 token contract using OpenZeppelin standards. The contract deploys successfully, but when I try to transfer tokens, I get a revert. Here's my contract:

\`\`\`solidity
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract MyToken is ERC20 {
    constructor() ERC20('My', 'MY') {
        _mint(msg.sender, 1000 * 10 ** 18);
    }
}
\`\`\`

And I'm calling transfer like: \`await token.transfer(recipient, amount)\`. What am I missing?`,
      tags: ['solidity', 'erc20', 'debugging'],
      author: '0x742d35Cc6634C0532925a3b844Bc9e7595f89Ac',
      displayName: 'alice.eth',
      status: 'answered',
      acceptedAnswerId: 'a_demo_1',
      votesCount: 24,
      answersCount: 2,
      viewsCount: 342,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'q_demo_2',
      title: 'Best practices for secure contract upgrades',
      description: `What are the best patterns for upgrading contracts while maintaining security? I've been reading about proxy patterns but I'm confused about:

1. Transparent vs UUPS proxies
2. Storage collision risks
3. How to handle state migrations

Any guidance would be appreciated!`,
      tags: ['security', 'proxy', 'upgrades'],
      author: '0x8a14A6B4b4F1c1E3F5B7d8A9e2c4d6f8A9e2c4d',
      displayName: 'bob.dev',
      status: 'answered',
      votesCount: 42,
      answersCount: 3,
      viewsCount: 567,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'q_demo_3',
      title: 'How to integrate MetaMask in React app',
      description: `I need to connect MetaMask to my React application. I've tried using web3.js but I'm not sure about the best approach in 2024.

Should I use:
- web3.js
- ethers.js
- wagmi + viem
- Something else?

Looking for a clean, type-safe solution that handles connection states properly.`,
      tags: ['web3', 'react', 'metamask'],
      author: '0x1234567890123456789012345678901234567890',
      displayName: 'charlie.web3',
      status: 'open',
      votesCount: 31,
      answersCount: 0,
      viewsCount: 189,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  const demoAnswers: Answer[] = [
    {
      id: 'a_demo_1',
      questionId: 'q_demo_1',
      author: '0x8a14A6B4b4F1c1E3F5B7d8A9e2c4d6f8A9e2c4d',
      displayName: 'bob.dev',
      content: `The issue is likely the amount you're passing. When working with ERC20 tokens, amounts need to account for decimals.

If your token has 18 decimals (standard), then to transfer 100 tokens, you need to pass:

\`\`\`javascript
const amount = ethers.parseEther("100"); // This handles the 18 decimals
await token.transfer(recipient, amount);
\`\`\`

Also make sure:
1. The sender has enough balance
2. The recipient address is valid (not zero address)
3. You're connected to the correct network

Here's a complete example:

\`\`\`javascript
const recipient = "0x...";
const amount = ethers.parseEther("100");

// Check balance first
const balance = await token.balanceOf(signer.address);
console.log("Balance:", ethers.formatEther(balance));

// Then transfer
const tx = await token.transfer(recipient, amount);
await tx.wait();
\`\`\``,
      upvotes: 18,
      downvotes: 0,
      aiGenerated: false,
      isAccepted: true,
      txHashes: ['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'],
      vibeReward: 50,
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'a_demo_2',
      questionId: 'q_demo_1',
      author: '0x1234567890123456789012345678901234567890',
      displayName: 'charlie.web3',
      content: `I had the same issue. Check your gas settings too. Sometimes reverts happen silently if gas is too low.

Try adding explicit gas limits:

\`\`\`javascript
await token.transfer(recipient, amount, { gasLimit: 100000 });
\`\`\``,
      upvotes: 5,
      downvotes: 0,
      aiGenerated: false,
      isAccepted: false,
      txHashes: [],
      vibeReward: 0,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ]

  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(demoQuestions))
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(demoAnswers))
}

