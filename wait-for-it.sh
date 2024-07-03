- name: Wait for services to be ready
  run: |
    timeout 60s bash -c 'while ! nc -z localhost 5000; do sleep 1; done'
    timeout 60s bash -c 'while ! nc -z localhost 3000; do sleep 1; done'
