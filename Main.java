import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Main {

    static class TreeNode {
        int value;
        List<TreeNode> children;

        TreeNode(int value) {
            this.value = value;
            this.children = new ArrayList<>();
        }
    }

    public static int calculateMax(int networkNodes, int[] networkFrom, int[] networkTo, int[] frequency) {
        List<List<Integer>> con = new ArrayList<>();
        for (int i = 0; i < networkNodes; i++) {
            con.add(new ArrayList<>());
        }

        for (int i = 0; i < networkFrom.length; ++i) {
            con.get(networkFrom[i] - 1).add(networkTo[i] - 1);
            con.get(networkTo[i] - 1).add(networkFrom[i] - 1);
        }

        int[] result = {0};
        dfs(0, -1, con, frequency, result);

        return result[0];
    }

    private static int dfs(int x, int f, List<List<Integer>> con, int[] v, int[] r) {
        int m1 = 0, m2 = 0;
        for (int y : con.get(x)) {
            if (y != f) {
                int m = dfs(y, x, con, v, r) + 1;
                if (Math.abs(v[y] - v[x]) <= 1) {
                    if (m >= m1) {
                        m2 = m1;
                        m1 = m;
                    } else if (m > m2) {
                        m2 = m;
                    }
                }
            }
        }
        r[0] = Math.max(r[0], m1 + m2);
        return m1;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter the number of network nodes: ");
        int networkNodes = scanner.nextInt();

        int[] networkFrom = new int[networkNodes - 1];
        int[] networkTo = new int[networkNodes - 1];
        int[] frequency = new int[networkNodes];

        System.out.println("Enter the connections (networkFrom networkTo) for " + (networkNodes - 1) + " edges:");
        for (int i = 0; i < networkNodes - 1; i++) {
            networkFrom[i] = scanner.nextInt();
            networkTo[i] = scanner.nextInt();
        }

        System.out.println("Enter the frequency for each node:");
        for (int i = 0; i < networkNodes; i++) {
            frequency[i] = scanner.nextInt();
        }

        int max = calculateMax(networkNodes, networkFrom, networkTo, frequency);
        System.out.println("The maximum value is: " + max);

        scanner.close();
    }
}