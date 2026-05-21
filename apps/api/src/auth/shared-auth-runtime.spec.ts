describe('@trycompai/auth root runtime', () => {
  it('can be required for permission lookups in a CommonJS runtime', () => {
    const authModule = require('@trycompai/auth');

    expect(authModule.allRoles.owner.authorize({ organization: ['read'] }).success).toBe(true);
    expect(authModule.BUILT_IN_ROLE_PERMISSIONS.admin.organization).toEqual(
      expect.arrayContaining(['read', 'update']),
    );
  });
});