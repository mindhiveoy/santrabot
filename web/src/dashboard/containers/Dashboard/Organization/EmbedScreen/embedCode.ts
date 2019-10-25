/**
 * Generate an embed code for chat
 *
 * @param organizationId Organization id for which the embed bot will be created
 * @param scriptUrL
 */
export const embedScript = (organizationId: string, scriptUrL: string): string => {
  return `
<script>
  (function(w, d, g, r, a, m) {
    w['SantraObject'] = r;
    (w[r] = w[r] || function() {
        (w[r].q = w[r].q || []).push(arguments);
    }), (w[r].l = 1 * new Date());
    (a = d.createElement('script')), (m = d.getElementsByTagName('script')[0]);
    a.async = 1; a.src = g; m.parentNode.insertBefore(a, m);
  })(window, document, '${scriptUrL}', 'santra');
  santra('o', '${organizationId}');
</script>`;
};
