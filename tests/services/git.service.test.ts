import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitServiceImpl } from '../../src/services/git.service';
import { simpleGit, SimpleGit } from 'simple-git';

vi.mock('simple-git');

describe('GitService', () => {
  let gitService: GitServiceImpl;
  let mockGit: any;

  beforeEach(() => {
    mockGit = {
      diff: vi.fn(),
      commit: vi.fn(),
      push: vi.fn(),
      branchLocal: vi.fn(),
    };
    (simpleGit as any).mockReturnValue(mockGit);
    gitService = new GitServiceImpl();
  });

  describe('getStagedDiff', () => {
    it('should return diff when there are staged changes', async () => {
      const mockDiff = 'diff content';
      mockGit.diff.mockResolvedValue(mockDiff);

      const result = await gitService.getStagedDiff();

      expect(mockGit.diff).toHaveBeenCalledWith(['--staged']);
      expect(result).toBe(mockDiff);
    });

    it('should throw error when there are no staged changes', async () => {
      mockGit.diff.mockResolvedValue('');

      await expect(gitService.getStagedDiff()).rejects.toThrow(
        'Failed to get staged changes: No staged changes found. Please stage your changes before generating a commit message.'
      );
    });
  });

  describe('getBranchName', () => {
    it('should return current branch name', async () => {
      mockGit.branchLocal.mockResolvedValue({ current: 'main' });
      const branch = await gitService.getBranchName();
      expect(branch).toBe('main');
    });

    it('should return empty string on error', async () => {
      mockGit.branchLocal.mockRejectedValue(new Error('git error'));
      const branch = await gitService.getBranchName();
      expect(branch).toBe('');
    });
  });

  describe('commit', () => {
    it('should format commit message correctly and commit', async () => {
      const message = {
        type: 'feat',
        scope: 'auth',
        subject: 'add login',
        body: 'implemented login logic',
        footer: 'Closes #123',
        isBreakingChange: false,
      };

      await gitService.commit(message);

      const expectedMsg = 'feat(auth): add login\n\nimplemented login logic\n\nCloses #123';
      expect(mockGit.commit).toHaveBeenCalledWith(expectedMsg);
    });

    it('should handle breaking changes', async () => {
      const message = {
        type: 'feat',
        subject: 'major update',
        isBreakingChange: true,
      };

      await gitService.commit(message);

      const expectedMsg = 'feat!: major update';
      expect(mockGit.commit).toHaveBeenCalledWith(expectedMsg);
    });
  });

  describe('push', () => {
    it('should call git push', async () => {
      await gitService.push();
      expect(mockGit.push).toHaveBeenCalled();
    });
  });
});
